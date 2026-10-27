#!/bin/sh
# open-bookshelf 用カスタムエントリポイント
#   1) 自己署名証明書が無ければ /etc/nginx/ssl に生成（HTTPS 対応）
#   2) nginx.conf テンプレートへ HTTPS_PORT（リダイレクト先のホスト側ポート）を展開
#   3) nginx を起動（シグナルを直接受け取るため exec で置き換える）
set -eu

CERT_DIR=/etc/nginx/ssl
CERT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"
CN="${HTTPS_CN:-localhost}"

# --- 1. 自己署名証明書（初回起動時にのみ生成。ssl-certs ボリュームで永続化） ---
if [ ! -s "$CERT_FILE" ] || [ ! -s "$KEY_FILE" ]; then
    mkdir -p "$CERT_DIR"
    echo "[entrypoint] Generating self-signed certificate (CN=$CN, 3650 days)..."
    SAN="DNS:$CN,DNS:localhost,IP:127.0.0.1"
    if [ -n "${HTTPS_SAN_DNS:-}" ]; then
        SAN="$SAN,DNS:$HTTPS_SAN_DNS"
    fi
    if [ -n "${HTTPS_SAN_IP:-}" ]; then
        SAN="$SAN,IP:$HTTPS_SAN_IP"
    fi
    openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
        -subj "/CN=$CN" \
        -addext "subjectAltName=$SAN" \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE"
    echo "[entrypoint] Certificate written to $CERT_DIR"
fi

# --- 2. テンプレート展開（nginx 変数 $host / $uri / $request_uri は対象外） ---
export HTTPS_PORT="${HTTPS_PORT:-443}"
envsubst '$HTTPS_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# --- 3. nginx 起動 ---
exec "$@"