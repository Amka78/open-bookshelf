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

## preload（ネイティブダイアログ連携）

`src-electrobun/preload.ts` が `window.__ELECTROBUN__` とネイティブダイアログの bridge を注入する。2.0.5 の Linux では `BrowserWindow` の `preload` に `views://preload/index.js` を渡しても実行されない（インライン JavaScript なら動く）。そのため `src-electrobun/index.ts` でビルド済みの `views/preload/index.js` を読み込み、インライン JavaScript として渡している。

```ts
const preloadScript = readFileSync(
  join(import.meta.dir, "..", "views", "preload", "index.js"),
  "utf8",
)
```

`window.__ELECTROBUN__` が `true` なら preload は効いている。`false`/`undefined` の場合はネイティブダイアログではなく Web のモーダルが使われる。

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