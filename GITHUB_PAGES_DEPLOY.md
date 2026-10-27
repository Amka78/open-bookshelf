# Github Pages デプロイガイド

Storybook を Github Pages にデプロイするための手順です。

## セットアップ手順

### 1. Repository Settings の設定

1. GitHub のリポジトリページを開く
2. **Settings** → **Pages** に移動
3. **Source** で **GitHub Actions** を選択

   ※ このワークフローは `actions/deploy-pages` を使うため、Source が `gh-pages` ブランチ指定では動作しません（2026-10-25 時点で Actions 方式を採用）。

### 2. 自動デプロイ

Github Actions ワークフロー（`.github/workflows/deploy-web.yml`）が設定されています。

`v*` タグを push すると自動的に以下が実行されます：

1. Storybook をビルド（`bun run build-storybook`）
2. `storybook-static` ディレクトリの内容を GitHub Pages にデプロイ

### 3. デプロイする

バージョンタグを付けて push します：

```bash
git tag v0.0.4
git push origin v0.0.4
```

## ローカルでのビルド確認

デプロイ前にローカルでビルドを確認できます：

```bash
# Storybook をビルド
bun run build-storybook

# 出力は storybook-static/ ディレクトリに生成されます

# ローカルで確認する場合
bun run storybook:web
# → http://localhost:6006 で確認
```

## ローカルから手動デプロイ

```bash
bun run deploy:pages
```

## アクセス URL

デプロイ後、以下の URL で Storybook にアクセスできます：

```
https://<your-username>.github.io/open-bookshelf/
```

## トラブルシューティング

### デプロイが environment protection rules で拒否される

Actions ログに `Tag "v0.0.9" is not allowed to deploy to github-pages due to environment protection rules.` と出る場合、`github-pages` 環境のデプロイ保護ルールが**デフォルトブランチ（main）のみ許可**になっているため、タグからのデプロイが拒否されています（ビルド自体は成功しています）。

1. リポジトリの **Settings** → **Environments** → `github-pages` を開く
2. **Deployment branches and tags** でタグを許可する：
   - 「All branches」に変更する（最も簡単）
   - または「Selected branches and tags」のまま タグパターン `v*` を追加（Branch / Tag が別タブの UI なら Tags 側に `v*` を入力、`main` はそのまま残す）
3. **Actions** タブで失敗した実行を **Re-run failed jobs** する（タグの再 push でも可、ただし他2ワークフローも再起動する）

### ビルドが失敗する場合

1. 依存関係を再インストール：

   ```bash
   bun install
   ```

2. Storybook のキャッシュをクリア：
   ```bash
   rm -rf storybook-static node_modules/.cache
   bun run build-storybook
   ```

### ページが表示されない場合

1. Repository Settings → Pages で設定を確認
2. gh-pages ブランチが存在するか確認：

   ```bash
   git branch -r | grep gh-pages
   ```

3. デプロイが完了しているか確認：
   - リポジトリの **Actions** タブでワークフローの実行状況を確認

## その他の注意事項

- Storybook は `@storybook/react-vite` でビルドされます
- `.storybook/web/` に設定ファイルがあります
- カスタムドメインを使用する場合は、Repository Settings → Pages で設定してください
