# Docker 版デプロイ・更新ガイド

Web 版を Docker イメージとしてビルドし、GHCR 経由でサーバーに配布するための**メンテナー向け**手順です。
利用者向けのインストール手順は [DOCKER_INSTALL.md](./DOCKER_INSTALL.md) を参照してください。

## 構成

```
v* タグ push
   └─ .github/workflows/docker.yml
        └─ ghcr.io/amka78/open-bookshelf:{latest, x.y.z, x.y}
             └─ サーバーの Watchtower（5分ポーリング、scope=open-bookshelf）
                  └─ open-bookshelf コンテナ（nginx:alpine が dist を SPA 配信）
```

- イメージは**公開**（pull に認証不要）
- 2ステージビルド。builder で `bun install` → `expo export --platform web`、実行ステージは `nginx:alpine` に `dist` と `nginx.conf` を COPY するだけ

## 反映経路が2つある（重要）

変更したファイルによって、反映に必要な作業が異なります。

| 変更したもの | 反映経路 | 必要な作業 |
|---|---|---|
| `docker-compose.yml` | サーバーが GitHub raw から `curl -O` して取得 | main へ push → サーバーで再取得 → `docker compose up -d` |
| `nginx.conf` | **イメージに焼き込まれる**（`Dockerfile:24`） | main へ push → `v*` タグ → CI がビルド → Watchtower が pull |
| アプリのソースコード | 同上（`expo export` で `dist` にビルド） | 同上 |

`nginx.conf` は `docker-compose.yml` から bind mount していないため、**イメージを再ビルドしない限り一切反映されません**。サーバー上で直接編集してもコンテナ再作成で消えます。

## 更新の反映手順

### 1. ローカルでコミットして main に push

作業ツリーに無関係な変更がある場合は、対象ファイルだけをステージします。

```bash
git status --porcelain          # 対象外の変更を確認
git add <変更したファイル>
git diff --staged               # 差分を確認
git commit -m "..."
git push origin main
```

`package.json` の `version` も上げるのがこのリポジトリの作法です（例: `0.0.3` → `0.0.4`）。
`app.config.ts` の `expo.version` は `0.0.1` 固定で運用されています。

### 2. タグを切る前に nginx 構文を検証

`nginx.conf` が不正だとコンテナが起動せず、`restart: unless-stopped` により**起動ループ**に落ちます。CI は `nginx -t` を実行しないため、push 後に手元で確認してください。

```bash
curl -sO https://raw.githubusercontent.com/Amka78/open-bookshelf/main/nginx.conf
docker run --rm -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine nginx -t
```

### 3. サーバーで Watchtower が生きているか確認

タグを切る前に Watchtower を直しておくと、以降は自動で反映されます。

```bash
docker logs --tail 30 watchtower
```

`level=error` や `Updated=0` が続く場合は「トラブルシューティング」を参照。

### 4. バージョンタグを push してイメージを再ビルド

```bash
git tag v0.0.4 && git push origin v0.0.4
```

> **⚠️ 副作用:** `v*` タグは3つのワークフローを**同時に**起動します。
>
> - `docker.yml` — GHCR イメージのビルド・push
> - `preview-release.yml` — **EAS Cloud で Android + iOS の preview ビルドを実行し、GitHub Release を作成**（EAS クレジットを消費、長時間）
> - `deploy-web.yml` — `tags: "*"` トリガーなので GitHub Pages にもデプロイ
>
> Docker イメージだけ更新したい場合は、事前に `preview-release.yml` のトリガーを外すか `workflow_dispatch` に変更してください。

ビルドは GitHub の **Actions** タブで確認できます（所要 10分前後）。

### 5. サーバーで反映を確認

Watchtower は最大5分後に自動で pull & 再起動します。待てない場合は手動で実行できます。

```bash
# 即時に更新チェックを1回だけ実行
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --run-once --scope open-bookshelf --cleanup

# 反映確認
docker images --digests ghcr.io/amka78/open-bookshelf     # latest の digest / IMAGE ID が変わったか
docker inspect -f '{{.State.StartedAt}}' open-bookshelf   # 再起動時刻
curl -sI http://localhost:${PORT:-3000}/ | grep -iE 'cache-control|last-modified|etag'
curl -s  http://localhost:${PORT:-3000}/ | grep -oE 'AppEntry-[a-f0-9]+\.js'
```

`AppEntry-<hash>.js` のハッシュが GHCR のイメージ内 `index.html` と一致していれば、コンテナは新イメージを配信しています。

イメージ側の中身を確認したい場合（docker が無い環境でも可、公開イメージなので匿名で取得できます）:

```bash
TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:amka78/open-bookshelf:pull" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.oci.image.index.v1+json" \
  https://ghcr.io/v2/amka78/open-bookshelf/manifests/latest
```

### 6. 既存クライアントは一度ハードリロード

`index.html` に `Cache-Control: no-cache` を付与する**前**から HTML をキャッシュしているブラウザは、ヒューリスティックな鮮度期間の最中は再検証すら行いません。Ctrl+Shift+R が1回必要です。それ以降は自動で追従します。

## トラブルシューティング

### Watchtower が更新しない（`is a directory`）

```
level=error msg="Unable to find default config file: /config.json: read /config.json: is a directory"
level=info  msg="Unable to update container \"/open-bookshelf\": /config.json: read /config.json: is a directory. Proceeding to next."
level=info  msg="Session done" Failed=0 Scanned=1 Updated=0
```

**原因:** `docker-compose.yml` が `${HOME}/.docker/config.json` を bind mount していたが、サーバー上にそのファイルが実在しなかった。Docker は存在しないパスを bind mount すると**空ディレクトリを自動生成**するため、`/config.json` がディレクトリになって認証ファイルとして読めなくなる。ホスト側の `docker` CLI も同じ理由で WARNING を出す。

**対処:** イメージは公開なので認証マウントは不要。`docker-compose.yml` から該当 volume と `DOCKER_CONFIG: /` を削除済み（2026-10-08）。サーバーには残骸ディレクトリが残るので除去する。

```bash
ls -la ~/.docker/config.json        # 空ディレクトリであることを確認
rmdir ~/.docker/config.json         # 空なら削除（docker CLI の WARNING も消える）
```

プライベートレジストリ化する場合は、実ファイルを用意してから `:ro` でマウントすること。

### `docker compose up -d` してもイメージが更新されない

Compose は `pull_policy` を指定しない限り、ローカルに同名タグのイメージがあれば**レジストリを確認せず使い回します**。`:latest` は特に引っかかりやすい。

```bash
docker compose pull && docker compose up -d
```

### コンテナは新しいのにブラウザが古いまま

サーバー内で `curl` した結果と、ブラウザが読み込んでいる `AppEntry-<hash>.js` を比較して切り分けます。

```bash
curl -s http://localhost:3000/ | grep -oE 'AppEntry-[a-f0-9]+\.js'   # コンテナが配信している内容
curl -sI https://<公開ドメイン>/ | grep -iE 'cache-control|via|x-cache'  # 手前のプロキシ/CDN
```

- コンテナが古い → Watchtower / pull の問題（上記2項目）
- コンテナは新しくブラウザだけ古い → クライアント側キャッシュ。`Via` / `X-Cache` が出ればリバースプロキシや CDN も疑う
- `index.html` に `Cache-Control` が無い → `nginx.conf` の修正がイメージに入っていない（再ビルドが必要）

### ビルドは成功したのに中身が古い（ローカルビルド時のみ）

`Dockerfile` の以下は **既知の問題**（2026-10-08 時点で未修正）:

```dockerfile
RUN timeout 300 bunx expo export --platform web --output-dir dist; \
    [ -f dist/index.html ] || exit 1
```

- `;` 区切りのため `expo export` の失敗（`timeout` による kill を含む）が**握りつぶされ**、成否が後段の存在チェックだけで決まる
- `.dockerignore` が無いため `COPY . .` でローカルの古い `dist/` と `node_modules/` がビルドコンテキストに入る。結果、export が失敗しても古い `dist/index.html` がチェックを通過し、「ビルド成功なのに中身が古い」イメージができる
- `node_modules/` は `bun install --frozen-lockfile` の結果を上書きする
- `timeout 300` は実測ビルド時間に対して余裕が小さい

CI はクリーンチェックアウト（`dist/` は gitignore 済み）なので影響を受けませんが、**ローカルで `docker build` する場合は必ず古い `dist/` を消してから**実行してください。恒久対策は `;` を `&&` にし、`.dockerignore`（`dist`, `node_modules`, `.git`, `.expo` 等）を追加すること。

## キャッシュ戦略

`nginx.conf` の設定意図:

| パス | 設定 | 理由 |
|---|---|---|
| `/_expo/static/` | `expires 1y` + `immutable` | ファイル名に content hash が入るため、内容が変われば URL も変わる |
| `/index.html` | `Cache-Control: no-cache, must-revalidate` | ハッシュ付きバンドルを参照する SPA シェル。毎回再検証しないと古い JS を参照し続ける |
| `/`（その他） | `try_files $uri $uri/ /index.html` | SPA フォールバック。内部リダイレクト後も `location = /index.html` に再マッチする |

`Cache-Control` を付けなかった場合、nginx は `Last-Modified` と `ETag` のみを返し、ブラウザはヒューリスティックキャッシュ（`Date - Last-Modified` の約10%）を**再検証なしに**適用します。
