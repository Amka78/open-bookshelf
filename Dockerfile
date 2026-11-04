# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV NODE_ENV=production

# Install dependencies (cached separately from source code)
COPY package.json bun.lock bunfig.toml ./
COPY bin/ ./bin/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source and build
COPY . .
# `;` にすると export が失敗（timeout 含む）しても exit code が無視され、
# 後段の存在チェックだけを通過して「成功なのに中身が古い」イメージになる。&& で伝播させる。
# timeout は実測（expo export に約5.5分）に対して 300s では余裕が無いため引き上げる。
RUN timeout 900 bunx expo export --platform web --output-dir dist && \
    [ -f dist/index.html ]

# Web リリース用 Calibre プロキシ。最終段は nginx:alpine（musl）なので musl 向けに
# 単体バイナリへコンパイルする。Bun ランタイムを最終イメージへ入れる必要がなくなる。
RUN bun build --compile --minify --target=bun-linux-x64-musl \
    scripts/webCalibreProxy.ts --outfile web-calibre-proxy

# Stage 2: Serve
FROM nginx:alpine

# 自己署名証明書の生成（openssl）・nginx.conf テンプレートの展開（envsubst）・
# Calibre プロキシ（musl 版 Bun ランタイムが libstdc++ を要求）に必要
RUN apk add --no-cache openssl gettext libstdc++

# nginx.conf はテンプレート。エントリポイントが ${HTTPS_PORT} を展開して
# /etc/nginx/conf.d/default.conf を生成する（HTTPS 用のサーバーブロックを含む）
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/web-calibre-proxy /usr/local/bin/web-calibre-proxy

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
