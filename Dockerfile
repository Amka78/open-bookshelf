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

# Stage 2: Serve
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
