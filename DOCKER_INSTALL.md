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
  -p 8443:443 \
  -e HTTPS_PORT=8443 \
  -e HTTPS_CN=localhost \
  -v ssl-certs:/etc/nginx/ssl \
  ghcr.io/amka78/open-bookshelf:latest
```

ブラウザで `https://localhost:8443` を開いてください。

Open `https://localhost:8443` in your browser.

> **自己署名証明書について / About the self-signed certificate**
>
> 初回起動時にコンテナが自己署名証明書を自動生成するため、ブラウザには証明書警告が出ます。
> 警告を承認して進めれば、クリップボード API を含む全機能が動作します（Secure Context 要件を満たすため）。
>
> A self-signed certificate is generated automatically on first container start, so your browser
> will show a certificate warning. Accept it and all features (including the clipboard API) will work.
>
> 接続に使う名前を `HTTPS_CN`（ホスト名）や `HTTPS_SAN_IP`（IP アドレス）で指定しておくと、
> 証明書がその名前に対応するため、警告回数が減ります。

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
| `PORT` | `3000` | HTTP リスナー（HTTPS へのリダイレクト用）のホスト側ポート / Host port of the HTTP listener (redirects to HTTPS) |
| `HTTPS_PORT` | `8443` | HTTPS のホスト側ポート。HTTP→HTTPS リダイレクト先にも使う / Host port of HTTPS; also used as the HTTP→HTTPS redirect target |
| `HTTPS_CN` | `localhost` | 自己署名証明書の CN / SAN に含めるホスト名 / Hostname embedded in the self-signed certificate CN and SAN |
| `HTTPS_SAN_IP` | （なし / none） | 証明書に追加する IP SAN（IP アドレスで接続する場合に指定）例: `192.168.1.50` / IP SAN to add to the certificate, e.g. when accessing via LAN IP |
| `HTTPS_SAN_DNS` | （なし / none） | 証明書に追加する DNS SAN / Additional DNS SAN entries |

> **注意:** HTTP（`PORT`）から HTTPS（`HTTPS_PORT`）へのリダイレクトは、コンテナ内の環境変数 `HTTPS_PORT` を使って生成されます。`docker run` では `-e HTTPS_PORT=<ホスト側ポート>` を必ずポート公開と揃えてください。compose では自動的に揃います。
>
> **Note:** the HTTP→HTTPS redirect is rendered inside the container from the `HTTPS_PORT` env var, so with `docker run` keep `-e HTTPS_PORT` in sync with the published port. With compose this is automatic.

---

## docker-compose（自動更新付き）/ docker-compose (with Auto-Update)

`docker-compose.yml` を使うと Watchtower による自動更新（5分ごとに GHCR をポーリング）も一緒に起動できます。

Using `docker-compose.yml` starts the app together with Watchtower, which polls GHCR every 5 minutes and automatically restarts the container on a new image.

```bash
# ファイルを取得 / Get the file
curl -O https://raw.githubusercontent.com/Amka78/open-bookshelf/main/docker-compose.yml

# 起動 / Start
docker compose up -d

# ブラウザで開く / Open in your browser
# https://localhost:8443

# ポートを変更する場合 / To change the port
HTTPS_PORT=9443 docker compose up -d
```

`PORT`（HTTP 側）・`HTTPS_PORT`・`HTTPS_CN` はどれも環境変数で変更できます。compose 上ではポート公開とリダイレクト先が自動的に揃います。

LAN の IP アドレスで接続する場合は、証明書に SAN を追加してください:

```bash
HTTPS_CN=localhost HTTPS_SAN_IP=192.168.1.50 docker compose up -d   # → https://192.168.1.50:8443
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

→ 別のポートを指定してください（compose なら `HTTPS_PORT` / `PORT`）。
→ Specify different ports, e.g. `HTTPS_PORT=9443 docker compose up -d` (use `PORT` for the HTTP redirect port).

**証明書を再生成したい / Regenerate the certificate**

```bash
docker compose down
docker volume rm open-bookshelf_ssl-certs   # プロジェクト名(open-bookshelf_)が付く場合あり
docker compose up -d
```

**HTTPS ページから Calibre へ接続できない / Cannot reach Calibre from an HTTPS page**

ブラウザは HTTPS ページから `http://` への XHR/fetch を Mixed Content としてブロックします。
Calibre の接続先は HTTPS（例: Nginx Proxy Manager の https URL）を指定してください。

Browsers block XHR/fetch from an HTTPS page to `http://` (mixed content). Point the Calibre URL
at an HTTPS endpoint (e.g. an Nginx Proxy Manager reverse-proxy URL).

**ログ確認 / View logs**

```bash
docker compose logs -f open-bookshelf
```

