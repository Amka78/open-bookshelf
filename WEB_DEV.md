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
- Web リリース（Docker）では、nginx が `index.html` に注入する `window.__CALIBRE_WEB_PROXY__` を見て同じ `/__calibre/` 経由になる（`DOCKER_DEPLOY.md` 参照）。開発用の `EXPO_PUBLIC_*` は `__DEV__` のときだけ有効。

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
- 401 の `WWW-Authenticate` を expose し、`Authorization`・Range・POST ボディを転送するため、Digest 認証もそのまま動く。
- `settingStore.api.baseUrl` には元の URL を保存したまま、リクエスト時だけプロキシ URL を使う（`app/utils/calibreProxy.ts`）。
- サムネイル・本文画像・PDF も同じプロキシ経由になる（`getCalibreRequestBase`）。

## 注意

- 開発専用。`127.0.0.1` にのみバインドする。
- 任意の URL を上流へ転送するため、このプロセスを外部公開しない。