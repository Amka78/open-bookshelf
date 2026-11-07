# Web 版の開発（CORS プロキシ）

Web 版をブラウザで開発していると、Calibre へのリクエストが別オリジンになり CORS で失敗する。デスクトップ版と同じ `/__calibre/<エンコードした接続先>/...` プロキシをローカルに立てることで回避できる。

## 起動

```bash
bun run dev:web
```

これだけで Calibre プロキシと Expo Web（Metro）が同時に起動する。ブラウザで `http://localhost:8081` を開く。

- プロキシは既定で `127.0.0.1:8082` を使う。使用中なら自動で空きポートに切り替わり、そのポートが Metro に渡される。
- ポートを固定したい場合は `CALIBRE_PROXY_PORT=8083 bun run dev:web`。
- Ctrl+C で Metro とプロキシの両方が終了する。
- `EXPO_PUBLIC_*` は Metro の起動時にバンドルへ埋め込まれる。値は `dev:web` が自動設定するため、通常は意識しなくてよい。
- Web リリース（Docker）では、nginx が `index.html` に注入する `window.__CALIBRE_WEB_PROXY__` を見て同じ `/__calibre/` 経由になる（`DOCKER_DEPLOY.md` 参照）。`EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN` は production ビルドでも有効。

### 別々に起動する場合

ターミナル1:

```bash
bun run dev:proxy
```

ターミナル2（表示されたポートに合わせる）:

```bash
EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN=http://127.0.0.1:8082 bun run expo:web
```

## 仕組み

- `scripts/calibreProxyDevServer.ts` が `src-electrobun/calibreProxy.ts` の `resolveCalibreTarget` / `proxyCalibreRequest` をそのまま使う。
- 401 の認証チャレンジは `X-Calibre-WWW-Authenticate` として expose する（同一オリジンの WebView が自前の認証ダイアログを出さないよう、標準の `WWW-Authenticate` は載せ替える）。`Authorization`・Range・POST ボディを転送するため、Digest 認証もそのまま動く。
- `settingStore.api.baseUrl` には元の URL を保存したまま、リクエスト時だけプロキシ URL を使う（`app/utils/calibreProxy.ts`）。
- 相対 URL・同一オリジンの絶対 URL・OPDS の href は `api.toRequestUrl()` でプロキシ URL に変換する。`fetchWithAuth` / `downloadFileWithAuth` / `loadOPDS` と、OPDS のアイコン・サムネイルもこれを通す。
- FormData のアップロードでは apisauce の既定 `Content-Type: application/json` を外し、ブラウザに boundary 付きの `multipart/form-data` を設定させる。
- サムネイル・本文画像・PDF も同じプロキシ経由になる（`getCalibreRequestBase`）。

## 別ホストのプロキシを使う静的ビルド

Docker の `window.__CALIBRE_WEB_PROXY__` を使わず、静的ホスティングと別ホストのプロキシを組み合わせる場合は、ビルド時にプロキシのオリジンを埋め込む。`EXPO_PUBLIC_*` は production ビルドでも有効。

```bash
EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN=https://proxy.example.com bun run build:web
```

同じオリジンにプロキシを置く場合は、Docker と同様に `window.__CALIBRE_WEB_PROXY__=true` を `index.html` に注入する。

## 注意

- 開発専用。`127.0.0.1` にのみバインドする。
- 任意の URL を上流へ転送するため、このプロセスを外部公開しない。