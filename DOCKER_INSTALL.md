# open-bookshelf

**Open BookShelf** の Web UI を nginx で配信する Docker イメージです。認証なしで取得できます。

Docker image that serves the **Open BookShelf** web UI via nginx. No authentication required to pull.

```
ghcr.io/amka78/open-bookshelf:latest
```

---

## Quick Start

```bash
docker run -d \
  --name open-bookshelf \
  --restart unless-stopped \
  -p 3000:80 \
  ghcr.io/amka78/open-bookshelf:latest
```

ブラウザで `http://localhost:3000` を開いてください。

Open `http://localhost:3000` in your browser.

---

## 利用可能なタグ / Available Tags

| タグ / Tag | 説明 / Description |
|------|------|
| `latest` | 最新の安定版（バージョンタグ push のたびに更新）/ Latest stable build (updated on every version tag push) |
| `1.2.3` | セマンティックバージョン完全指定 / Exact semantic version |
| `1.2` | メジャー.マイナー指定（パッチ更新を自動追従）/ Major.minor (auto-follows patch updates) |

---

## 環境変数 / Environment Variables

| 変数名 / Variable | デフォルト / Default | 説明 / Description |
|--------|-----------|------|
| `PORT` | `3000` | ホスト側の公開ポート番号 / Host port to expose the app |

---

## docker-compose（自動更新付き）/ docker-compose (with Auto-Update)

`docker-compose.yml` を使うと Watchtower による自動更新（5分ごとに GHCR をポーリング）も一緒に起動できます。

Using `docker-compose.yml` starts the app together with Watchtower, which polls GHCR every 5 minutes and automatically restarts the container on a new image.

```bash
# ファイルを取得 / Get the file
curl -O https://raw.githubusercontent.com/Amka78/open-bookshelf/main/docker-compose.yml

# 起動 / Start
docker compose up -d

# ポートを変更する場合 / To use a different port
PORT=8080 docker compose up -d
```

---

## 更新・停止 / Update & Stop

```bash
# 手動で最新イメージに更新 / Manually update to latest
docker pull ghcr.io/amka78/open-bookshelf:latest
docker compose down && docker compose up -d

# 停止 / Stop
docker compose stop

# 停止してコンテナを削除 / Stop and remove containers
docker compose down

# イメージも含めて削除 / Remove containers and images
docker compose down --rmi all
```

---

## トラブルシューティング / Troubleshooting

**ポートが使用中 / Port already in use**

```
Error: bind: address already in use
```

→ `PORT=8080 docker compose up -d` のように別のポートを指定してください。  
→ Specify a different port, e.g. `PORT=8080 docker compose up -d`.

**ログ確認 / View logs**

```bash
docker compose logs -f open-bookshelf
```

