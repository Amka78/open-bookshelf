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

`v*` タグの push で以下が起動します。**EAS preview build は macOS runner でコストが高い**ため、push は意図的に済ませること。

| ワークフロー | 内容 |
|---|---|
| `docker.yml` | GHCR へ Docker イメージ push → サーバーの Watchtower が pull して本番 Web を更新 |
| `preview-release.yml` | EAS preview build（Android / iOS）+ GitHub Release 作成 |
| `deploy-web.yml` | Storybook を GitHub Pages へデプロイ |

## 手動で push する場合

```sh
git push origin HEAD
git push origin vX.Y.Z
```

## 関連

- Docker 配布の詳細: [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)