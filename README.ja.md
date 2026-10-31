# Open BookShelf

[English](./README.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

Open BookShelf は [Calibre](https://calibre-ebook.com/) の蔵書を扱うクロスプラットフォームのクライアントです。iOS・Android・Web で、蔵書の閲覧・検索・編集・読書ができます。

Calibre のコンテンツサーバー（REST/OPDS）に接続して使うアプリで、Calibre 本体を同梱しているわけではありません。

## 主な機能

- **蔵書ブラウズ** — グリッド・リスト・テーブルの3表示。並び替え、絞り込み、件数付きのタグブラウザ
- **検索** — サーバー側検索と追加読み込み
- **メタデータ編集** — タイトル、著者、タグ、シリーズ、カスタム列、表紙の編集。テーブル表示ではインライン編集を自動保存
- **ビューア** — EPUB/AZW3 のページ送り表示（横書き・縦書き、ページ方向の設定可）、PDF、CBZ などの画像ベースの本
- **注釈** — 対応フォーマットでのハイライトとメモ
- **読書履歴** — 読書ステータスと前回の読書位置
- **Calibre ジョブ** — 書籍変換と OCR（文字認識）結果の確認
- **多言語 UI** — 英語・日本語・韓国語・アラビア語
- **OTA 更新** — EAS Update でアプリを再ビルドせずに JS とアセットを更新

## 技術構成

| 領域 | 使用技術 |
| --- | --- |
| フレームワーク | Expo SDK 57、React Native 0.86、React 19 |
| 言語 | TypeScript 7 |
| 状態管理 | MobX State Tree 5 |
| ナビゲーション | React Navigation 7（native stack） |
| UI | gluestack-ui 1.x、react-native-svg、expo-image |
| リスト | FlashList 2 |
| 閲覧 | react-native-pdf、react-native-webview（ページ送りビューア） |
| 多言語化 | i18n-js |
| テスト | Vitest 3（jsdom）＋ Storybook 8 の play 関数（Playwright 経由の Chromium） |
| ツール | Bun、Biome、EAS Build / EAS Update |

## ディレクトリ構成

```
open-bookshelf
├── app/
│   ├── components/     # UI コンポーネント（必要に応じて *.stories.tsx を同居）
│   ├── config/         # 環境別の設定
│   ├── hooks/          # 共有フック（@/hooks 経由で import）
│   ├── i18n/           # en / ja / ko / ar の辞書
│   ├── library/        # ビューアとページ分割のロジック
│   ├── models/         # MobX State Tree のストア
│   ├── navigators/     # ナビゲーション設定
│   ├── screens/        # 接続・蔵書・詳細・編集・ビューア・変換・OCR など
│   ├── services/       # Calibre API クライアント、ストレージ、ログ
│   ├── theme/          # 色・余白・タイポグラフィ
│   ├── type/           # 共通型定義
│   └── utils/
├── assets/             # アイコン、スプラッシュ、画像
├── .storybook/         # Web / Native 用 Storybook
├── test/               # Vitest のセットアップとモック
├── scripts/            # ビルド・バージョン更新・EAS 用スクリプト
├── .github/workflows/  # CI、Docker、GitHub Pages、EAS ビルド/更新
├── Dockerfile          # nginx で配信する Web ビルド
└── app.config.ts       # Expo 設定
```

## はじめかた

### 前提

- Node.js 20 以上と [Bun](https://bun.sh/)
- 端末から到達できる Calibre コンテンツサーバー
- ローカルでネイティブビルドする場合: Android Studio（Android）または Xcode（iOS、macOS のみ）

Android/iOS の配布ビルドは通常 EAS Build で作るため、Android の作業に Mac は不要です。

### インストールと起動

```bash
git clone git@github.com:Amka78/open-bookshelf.git
cd open-bookshelf
bun install

bun run start        # Expo Go（JS のみの開発）
bun run expo:web     # Web 開発サーバー
```

ビューアはネイティブモジュールを使うため、ネイティブ機能まで確認するときは開発ビルドを使います。

```bash
bun run eas:android:dev   # 開発クライアントをビルドしてインストール
bun run start:dev-client
```

起動後、Calibre サーバーの URL と認証情報を入力し、ライブラリを選択してください。

## よく使うコマンド

```bash
bun run check            # 型チェック + lint + フォーマット確認 + unit + story テスト
bun run compile          # tsc --noEmit
bun run lint             # Biome lint
bun run format           # Biome format（書き込み）
bun run test:unit        # Vitest（jsdom）
bun run test:story       # Storybook play テスト（Chromium）
bun run build:web        # Web ビルドを dist/ に出力
bun run version 0.2.0    # app.config.ts と package.json を更新してタグを作成
```

`bun run version` は `app.config.ts` と `package.json` の両方を更新し、annotated タグを作成します。`--push` を付けるとコミットとタグを push します。詳しい手順は [RELEASE.md](./RELEASE.md) を参照してください。

## テスト

- **ユニットテスト**（`*.test.ts(x)`、Vitest + jsdom）はモデル、ユーティリティ、ロジックを対象にします。
- **UI 操作テスト**は Storybook の `play` 関数（`*.stories.tsx`）に書き、`bun run test:story` で実際の Chromium 上で実行します。クリック・貼りつけ・入力はこちらで検証し、Calibre API は `api.*` のスタブに差し替えて実サーバーへは送りません。
- CI は push と pull request のたびに型チェック、ユニットテスト、story テストを実行します。

## Docker（Web 版）

Web ビルドは公開イメージとして配布し、nginx で HTTPS 配信します。

```bash
docker run -d \
  --name open-bookshelf \
  --restart unless-stopped \
  -p 3000:80 \
  -p 8443:443 \
  -e HTTPS_PORT=8443 \
  -e HTTPS_CN=localhost \
  -v ssl-certs:/etc/nginx/ssl \
  ghcr.io/amka78/open-bookshelf:latest
```

`https://localhost:8443` を開いてください。初回起動時に自己署名証明書を生成するため、ブラウザに一度警告が出ます。クリップボード API は Secure Context でのみ動くため HTTPS が必要です。

Watchtower による自動更新にも対応しています。リポジトリ内の `docker-compose.yml` が参考構成です。利用者向けは [DOCKER_INSTALL.md](./DOCKER_INSTALL.md)、メンテナー向けは [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) を参照してください。

## モバイルビルドとリリース

- `bun run eas:android:preview` / `bun run eas:ios:preview` — EAS のローカルビルド
- `bun run eas:android:prod` / `bun run eas:ios:prod` — 本番ビルド
- `v*` タグを push すると preview の OTA 更新と Web/Docker の成果物が配信されます。APK はビルドされません
- preview APK を作り直す場合は **Preview APK Build (Manual)** ワークフローを手動実行します

リリース手順は [RELEASE.md](./RELEASE.md)、ビルドのトラブルシューティングは [EAS_BUILD.md](./EAS_BUILD.md) を参照してください。

## ドキュメント

- [RELEASE.md](./RELEASE.md) — バージョン更新、タグ、OTA、APK ビルド
- [EAS_BUILD.md](./EAS_BUILD.md) — EAS ビルドのトラブルシューティング
- [DOCKER_INSTALL.md](./DOCKER_INSTALL.md) — Docker で Web 版を動かす
- [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) — Docker 構成のデプロイと更新
- [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) — Storybook の GitHub Pages 配信
- [Design.md](./Design.md) — 設計メモ

## ライセンス

このプロジェクトは **PolyForm Noncommercial License 1.0.0** の下で公開しています。個人利用、学習、ホビー、研究、教育、非営利団体での利用など、非商用目的であれば使用・改変・再頒布が自由です。

法人や個人事業主による商用利用には、別途商用ライセンスが必要です。企業の社内業務での利用、商用製品・サービスへの組み込み、有償での再頒布が含まれます。

商用ライセンスの条件は現在準備中です。ご相談は [github.com/Amka78/open-bookshelf](https://github.com/Amka78/open-bookshelf/issues) の Issue でお願いします。

ライセンス全文は [LICENSE](./LICENSE) を参照してください。依存ライブラリはそれぞれのライセンスに従います。