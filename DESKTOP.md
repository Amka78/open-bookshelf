# デスクトップ版（Electrobun）開発ガイド

`bun run desktop` で Electrobun のデスクトップシェルを起動する。開発中は Expo の **Web バンドル**（`http://localhost:8081`）を WebView で表示するため、Metro を別ターミナルで起動しておく（`desktop` スクリプトが `ELECTROBUN_WEB_URL` を設定する）。配布ビルドでは `dist/` を同梱し、Bun 側のローカル HTTP サーバーで配信する。

```sh
# ターミナル1: Web バンドル（Metro）
bun run expo:web

# ターミナル2: デスクトップシェル
bun run desktop
```

Windows などで `VAR=value command` 形式が使えないシェルから実行する場合は、`ELECTROBUN_WEB_URL=http://localhost:8081` を環境変数として自分で設定してから `electrobun dev` を起動する（未設定だと同梱 Web バンドルを配信しようとする）。

## Linux / WSL の前提パッケージ

WebKitGTK 4.1 と AppIndicator の実行時ライブラリが必要。未導入だと `libNativeWrapper.so` のロード時に `libwebkit2gtk-4.1.so.0: cannot open shared object file` で落ちる。

```sh
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-0 libayatana-appindicator3-1
```

不足ライブラリは次で確認できる（`libasar.so` は同梱済みのため not found でも無害）。

```sh
ldd build/dev-linux-x64/open-book-shelf-dev/bin/libNativeWrapper.so | grep 'not found'
```

## WSLg での GLX エラー

WSLg（XWayland）では GTK の GLX 初期化に失敗し、起動時に `X11 Error: GLXBadWindow (code 170)` が出る。`desktop` スクリプトで `WEBKIT_DISABLE_COMPOSITING_MODE=1` を設定して回避している。次の `libEGL warning: DRI3 error` はソフトウェア合成では正常で、動作に影響しない。

```
libEGL warning: DRI3 error: Could not get DRI3 device
```

## バンドル構成（Electrobun 2.x / Hutch）

Electrobun 2.x のビルドは Hutch が担当する。初回実行時に版に対応した Hutch をダウンロードし、SDK を `.hutch/devkit/` に展開する（`.hutch/` と `.cottontail-tmp/` は gitignore 済み）。`package.json` の `electrobun` は `2.0.5` に固定している。

- `electrobun.config.ts` の `build.mainProcess: "bun"` は 2.x では必須。
- メインプロセスのエントリは `Resources/app/bun/index.js`、各 view は **`views/<view-name>/index.js`** に出力される（2.x は entrypoint のファイル名に依存しない）。
- ランチャーは `Resources/app/bun/index.js` を固定で読むため、`build.bun.entrypoint` は `src-electrobun/index.ts` のままにする。

## preload（プロキシ origin の注入）

`src-electrobun/preload.ts` が `window.__ELECTROBUN__` を注入する。2.0.5 の Linux では `BrowserWindow` の `preload` に `views://preload/index.js` を渡しても実行されない（インライン JavaScript なら動く）。そのため `src-electrobun/index.ts` でビルド済みの `views/preload/index.js` を読み込み、インライン JavaScript として渡している。プロキシのポートは起動ごとに変わるため、preload の先頭で `window.__ELECTROBUN_PROXY_ORIGIN` も注入する。

```ts
const preloadScript = `window.__ELECTROBUN_PROXY_ORIGIN = ${JSON.stringify(localServer.origin)};
${readFileSync(join(import.meta.dir, "..", "views", "preload", "index.js"), "utf8")}`
```

`window.__ELECTROBUN__` が `true` なら preload は効いている。

**ネイティブダイアログは使わない。** `Utils.showMessageBox` は UI スレッドへ同期ディスパッチする実装で、WebView からの RPC ハンドラ内で呼ぶとダイアログが表示されないまま RPC がタイムアウトする（Windows で実測）。再開確認ダイアログでこれが起きると `viewerReady` が false のままになり、ビューアが黒画面で固まる。ConfirmModal / ErrorModal は `useElectrobunModal` から modalfy の Web モーダルへ流している。preload の `__electrobunShowConfirm` / `__electrobunShowError` は Electrobun 側の修正後に戻すため残している。

## Calibre API のプロキシ（CORS 回避）

Electrobun の WebView はブラウザと同じ CORS 判定を行うため、`http://127.0.0.1:<port>` から Calibre へ直接アクセスすると CORS で失敗する（Android はネイティブ通信なので発生しない）。Electrobun の API には CORS を無効化する設定が無いため、同梱 Web バンドルを配信している Bun サーバーがリバースプロキシになる。

- プロキシのパスは `/__calibre/<encodeURIComponent(CalibreのベースURL)>/...`。`src-electrobun/calibreProxy.ts` が上流 URL に解決し、`Authorization`・Range・POST ボディをそのまま流す。
- `api.setUrl()` は Electrobun のときだけ axios の baseURL をプロキシに差し替える。`settingStore.api.baseUrl` にはユーザーが入力した元 URL をそのまま保存するので、ConnectScreen の表示・再接続・OPDS は従来どおり。
- Digest 認証の `uri` は上流のパスでなければ通らないため、`api.ts` は元 URL を保持し、プロキシ URL を上流に戻してから計算する。ベース URL にパス（例: `http://host/calibre`）がある場合は、そのパスも含めて連結する。
- 上流の `401 + WWW-Authenticate` はそのまま返さず、`X-Calibre-WWW-Authenticate` に載せ替える。同一オリジンの WebView2 / WebKitGTK は `WWW-Authenticate` を見ると自前の認証ダイアログを開き、アプリの `LoginModal` や Digest ネゴシエーションに 401 が届かなくなるため。`api.ts` は両方のヘッダーを読む。
- 開発時は Metro（`localhost:8081`）からプロキシへクロスオリジンになるため、プロキシは CORS ヘッダーと `OPTIONS` を処理し、`X-Calibre-WWW-Authenticate`（互換のため `WWW-Authenticate` も）を expose する。
- 制約: 自己署名 HTTPS の Calibre は Bun の `fetch` が証明書エラーで止まる。ブラウザのように警告を承認して続行することはできない。

動作確認は、アプリ起動中に待受ポートを調べて直接叩ける。

```bash
# http://calibre.local:8080 をエンコードした例
curl "http://127.0.0.1:<proxy-port>/__calibre/http%3A%2F%2Fcalibre.local%3A8080/interface-data/init"
```

## 配布ビルドと OTA（canary のみ）

Electrobun は **自動更新（Updater）を内蔵**している。このリポジトリでは **canary チャンネルだけ**を配信する（stable は未運用）。

### 成果物

`bun run desktop:build`（`bun run build:web` + `electrobun build --env=canary`）で `artifacts/` に次が出る。`artifacts/` は gitignore 済み。

- `canary-<os>-<arch>-update.json` … 更新マニフェスト（チャンネル / ハッシュ / tar 名）
- `canary-<os>-<arch>-open-book-shelf-canary.tar.zst` … 更新本体
- `canary-<os>-<arch>-<hash>.patch` … 前版との差分（前回リリースがある場合）
- `*-Setup.*` … インストーラ

### 配信先

GitHub Releases の**固定タグ** `desktop-canary`（prerelease）に、インストーラと更新ファイルを同居させ、`gh release upload --clobber` で上書きする。`electrobun.config.ts` の `release.baseUrl` は次で固定。

```
https://github.com/Amka78/open-bookshelf/releases/download/desktop-canary
```

アプリはトークン無しでここを取得するため、**リポジトリが public であること**が前提。

### CI

- `.github/workflows/desktop-canary.yml`（手動）: `desktop-build.yml` を呼び、macOS arm64 / macOS x64 / Windows x64 / Linux x64 をビルドして**インストーラ込み**で `desktop-canary` にアップロードする。
- `.github/workflows/desktop-ota.yml`（`v*` タグ push）: 同じビルドを行い、**OTA 用ファイル（update.json / tar.zst / patch）だけ**を `desktop-canary` に上書きする。バージョンは `bun run version` で3ファイル（`package.json` / `app.config.ts` / `electrobun.config.ts`）に同期される。

Electrobun はクロスコンパイルできないため、各 OS のネイティブランナーでビルドする（`macos-14` = arm64、`macos-15-intel` = x64）。

### 署名

現状は**未署名**。macOS は Gatekeeper の警告が出るので右クリック→「開く」、Windows は SmartScreen の警告を許可して起動する。証明書を用意できたら `electrobun.config.ts` の macOS 設定で `codesign` / `notarize` を有効化する。

### 動作

アプリ起動時に `Updater.checkForUpdate()` を実行し、更新があればネイティブダイアログで確認 → `downloadUpdate()` → `applyUpdate()`（再起動）。通信失敗や更新失敗はログのみで起動は継続する。開発実行（`ELECTROBUN_WEB_URL` あり）と `dev` チャンネルではチェックしない。

## よくある症状

| 症状 | 原因 |
| --- | --- |
| `libwebkit2gtk-4.1.so.0: cannot open shared object file` | Linux の前提パッケージ不足（上記 apt） |
| `X11 Error: GLXBadWindow` | WSLg の GLX。`WEBKIT_DISABLE_COMPOSITING_MODE=1` で回避（スクリプト設定済み） |
| ログに `GTK EVENT LOOP STARTED` は出るがウィンドウが出ない | `Resources/app/bun/index.js` が生成されていない（Hutch のビルドログを確認） |
| 画面が「問題が発生しました」になる | WebView 内の JS エラー。Metro のログを確認する |
| 401 後にログイン画面が出ない／一瞬だけ出て消える | `react-native-modalfy` の `closeModal()` がアニメーション終了時点の最新モーダルを閉じてしまう競合。`patches/react-native-modalfy+3.7.0.patch` で修正済み（`bun install` の postinstall で適用） |