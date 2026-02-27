# Calibre CORS プロキシ設定

Web版でブラウザのCORSポリシーを回避するため、CalibreサーバーをnginxまたはCaddyの背後に置いてCORSヘッダーを付与します。

## 構成

```
ブラウザ → nginx/Caddy (8082番ポート) → Calibre (8081番ポート)
```

アプリの接続先は `http://192.168.1.11:8082` に変更してください。

---

## nginx

### インストール

```bash
# macOS
brew install nginx

# Ubuntu/Debian
sudo apt install nginx
```

### 設定ファイル (`/etc/nginx/conf.d/calibre.conf`)

```nginx
server {
    listen 8082;
    server_name _;

    # CORSヘッダーを全レスポンスに付与
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # OPTIONSプリフライトリクエストに即応答
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept';
        add_header 'Content-Length' '0';
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }
}
```

### 起動・再起動

```bash
# macOS
nginx
nginx -s reload

# Linux
sudo systemctl start nginx
sudo systemctl reload nginx
```

---

## Caddy（nginx より設定が簡単）

### インストール

```bash
# macOS
brew install caddy

# Ubuntu/Debian
sudo apt install caddy
```

### Caddyfile

```
:8082 {
    header Access-Control-Allow-Origin *
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Authorization, Content-Type, Accept"

    @preflight method OPTIONS
    respond @preflight 204

    reverse_proxy 127.0.0.1:8081
}
```

### 起動

```bash
caddy run --config Caddyfile
# またはバックグラウンド実行
caddy start --config Caddyfile
```

---

## Calibreと同じPCでない場合

`proxy_pass` / `reverse_proxy` のアドレスをCalibreが動いているホストに変更してください。

```nginx
# nginx
proxy_pass http://192.168.1.11:8081;
```

```
# Caddy
reverse_proxy 192.168.1.11:8081
```

この場合、アプリの接続先はnginx/Caddyが動いているマシンのIPアドレスになります。
