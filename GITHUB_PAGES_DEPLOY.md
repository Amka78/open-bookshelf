# Github Pages デプロイガイド

このアプリの Web 版を Github Pages にリリースするための手順です。

## セットアップ手順

### 1. Repository Settings の設定

1. GitHub のリポジトリページを開く
2. **Settings** → **Pages** に移動
3. **Source** で以下を設定：
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. **Save** をクリック

### 2. 自動デプロイの有効化

Github Actions ワークフロー（`.github/workflows/deploy-web.yml`）が既に設定されています。

main ブランチに push されると自動的に以下が実行されます：

1. Web 版をビルド
2. dist ディレクトリの内容を gh-pages ブランチにデプロイ
3. Github Pages でホスト

### 3. デプロイする

main ブランチに commit して push します：

```bash
git add .
git commit -m "Deploy to Github Pages"
git push origin main
```

## ローカルでのビルド確認

デプロイ前にローカルでビルドを確認できます：

```bash
# ビルド
GITHUB_PAGES=true yarn build:web

# 出力は dist/ ディレクトリに生成されます
```

## アクセス URL

デプロイ後、以下の URL でアプリにアクセスできます：

```
https://<your-username>.github.io/open-bookshelf/
```

## トラブルシューティング

### ビルドが失敗する場合

1. Node.js のバージョンを確認：

   ```bash
   node --version  # v18以上推奨
   ```

2. 依存関係を再インストール：

   ```bash
   yarn install --frozen-lockfile
   ```

3. キャッシュをクリア：
   ```bash
   yarn clean
   yarn install
   GITHUB_PAGES=true yarn build:web
   ```

### ページが表示されない場合

1. Repository Settings → Pages で設定を確認
2. gh-pages ブランチが存在するか確認：

   ```bash
   git branch -r | grep gh-pages
   ```

3. デプロイが完了しているか確認：
   - リポジトリの **Actions** タブでワークフローの実行状況を確認

## 環境変数

- `GITHUB_PAGES=true` - ビルド時に自動設定され、ホームページパスが`/open-bookshelf/`に設定されます

## その他の注意事項

- Web 版のビルド時は、React Native の一部機能（ネイティブモジュール）は使用できません
- プロダクション環境での動作確認を推奨します
- カスタムドメインを使用する場合は、Repository Settings → Pages で設定してください
