#!/bin/sh
# open-bookshelf 用カスタムエントリポイント
#   1) 自己署名証明書が無ければ /etc/nginx/ssl に生成（HTTPS 対応）
#   2) nginx.conf テンプレートへ HTTPS_PORT（リダイレクト先のホスト側ポート）を展開
#   3) Calibre プロキシを起動し、index.html に有効フラグを注入（CALIBRE_PROXY=0 で無効）
#   4) nginx を起動（シグナルを直接受け取るため exec で置き換える）
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

# --- 3. Calibre プロキシ（同一オリジン化して CORS を回避） ---
CALIBRE_PROXY_ENABLED="${CALIBRE_PROXY:-1}"
case "$CALIBRE_PROXY_ENABLED" in
    0|false|off|no) CALIBRE_PROXY_ENABLED=0 ;;
    *) CALIBRE_PROXY_ENABLED=1 ;;
esac

if [ "$CALIBRE_PROXY_ENABLED" = "1" ]; then
    # nginx.conf の proxy_pass と揃えるため固定（外部からの上書きは無視する）
    export CALIBRE_PROXY_PORT=8082
    export CALIBRE_PROXY_ALLOWED_HOSTS="${CALIBRE_PROXY_ALLOWED_HOSTS:-}"
    echo "[entrypoint] Starting Calibre proxy on 127.0.0.1:${CALIBRE_PROXY_PORT}..."
    /usr/local/bin/web-calibre-proxy &

    PROXY_READY=0
    i=0
    while [ "$i" -lt 50 ]; do
        if wget -q -O /dev/null "http://127.0.0.1:${CALIBRE_PROXY_PORT}/__calibre/health" 2>/dev/null; then
            PROXY_READY=1
            break
        fi
        i=$((i + 1))
        sleep 0.1
    done

    if [ "$PROXY_READY" != "1" ]; then
        echo "[entrypoint] Calibre proxy did not become ready" >&2
        exit 1
    fi

    # アプリはこのフラグを見て同一オリジンの /__calibre/ を使う
    INDEX_FILE=/usr/share/nginx/html/index.html
    if ! grep -q "__CALIBRE_WEB_PROXY__" "$INDEX_FILE"; then
        sed -i 's#</head>#<script>window.__CALIBRE_WEB_PROXY__=true;</script></head>#' "$INDEX_FILE"
    fi
    if ! grep -q "__CALIBRE_WEB_PROXY__" "$INDEX_FILE"; then
        echo "[entrypoint] Failed to inject the Calibre proxy flag into index.html" >&2
        exit 1
    fi
    echo "[entrypoint] Calibre proxy enabled (allowed hosts: ${CALIBRE_PROXY_ALLOWED_HOSTS:-any})"
else
    # 同じコンテナを CALIBRE_PROXY=0 で再起動した場合に備えて、注入済みフラグを除去する
    sed -i 's#<script>window.__CALIBRE_WEB_PROXY__=true;</script>##' /usr/share/nginx/html/index.html
    echo "[entrypoint] Calibre proxy disabled (CALIBRE_PROXY=0)"
fi

# --- 4. nginx 起動 ---
exec "$@"