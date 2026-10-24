---

# リリース手順（バージョン更新）

バージョンを上げて配布するための**メンテナー向け**手順です。
`scripts/version.sh` がバージョン更新の唯一の入口です（2026-10-20 に `bin/release-tag.sh` から統合）。

## 使い方

```sh
bun run version <patch|minor|major|x.y.z> [--push]
```

- `patch` / `minor` / `major`：現在のバージョンから自動で加算
- `x.y.z`：明示的なバージョン指定
- `--push`：ブランチとタグの push を対話確認付きで行う（既定は push しない）

### 実行前の自動チェック

- 作業ツリーに変更された tracked ファイルがないこと（untracked は警告のみ）
- `origin/<現在のブランチ>` と同期していること（ahead/behind 0）
- `v<新バージョン>` タグがローカル・リモートのどちらにも存在しないこと
- 更新後、`package.json` と `app.config.ts` の version が一致していること（不一致なら変更を元に戻して中止）

## 実行されること

1. `package.json` と `app.config.ts` の `version` を更新
2. コミット（メッセージ: `vX.Y.Z にバージョンアップ`）+ annotated タグ `vX.Y.Z` を作成
3. `--push` 指定時のみ、確認の上で `git push origin HEAD` と `git push origin vX.Y.Z` を実行

## 重要な注意: タグ push で3ワークフローが同時起動する

`v*` タグの push で以下が起動します。**preview への OTA 配信（EAS Update）が無条件で走る**ため、push は意図的に済ませること。

| ワークフロー | 内容 |
|---|---|
| `docker.yml` | GHCR へ Docker イメージ push → サーバーの Watchtower が pull して本番 Web を更新 |
| `preview-release.yml` | **EAS Update で preview チャンネルへ OTA 配信**（ビルド・Release 作成なし） |
| `deploy-web.yml` | Storybook を GitHub Pages へデプロイ |

## OTA 配信（タグ push 時）

`v*` タグ push は APK をビルドせず、**EAS Update（OTA）** で preview チャンネルへ JS/アセットの変更を配信します（`eas update --channel preview`）。
ネイティブ構成（config plugin・eas.json・SDK 等）を変えていない限り、配布済み Preview APK には **アプリの次回起動時に**変更が反映されます（`fallbackToCacheTimeout: 0` のため起動後にチェックして次回反映）。

## APK の再ビルド（手動）

ネイティブ変更・SDK アップグレード・eas.json 変更などで APK 自体の再ビルドが必要な場合は、Actions の **Preview APK Build (Manual)**（`preview-apk.yml`）を手動実行します。

1. GitHub の Actions タブ → **Preview APK Build (Manual)** → **Run workflow**
2. リリースバージョン（例: `v1.2.3`）を入力して実行
3. 完了後、`open-bookshelf-<version>-preview.apk` が**GitHub Prerelease** に添付されて作成される

本番（production）チャンネルへの OTA は `eas update --channel production`（リリース手順に合わせて手動実行）。

## 手動で push する場合

```sh
git push origin HEAD
git push origin vX.Y.Z
```

## 関連

- Docker 配布の詳細: [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)