# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

ENV CI=1
ENV EXPO_NO_TELEMETRY=1

# Install dependencies (cached separately from source code)
COPY package.json bun.lock bunfig.toml ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bunx expo export --platform web --output-dir dist

# Stage 2: Serve
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
