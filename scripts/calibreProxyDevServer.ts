/**
 * Web 開発（`expo start --web`）用の Calibre プロキシ。
 *
 * デスクトップ版と同じ `/__calibre/<エンコードした接続先>/...` を 127.0.0.1 で提供する。
 * 通常は `bun run dev:web`（scripts/devWeb.ts）から起動し、Metro と同じコマンドで立ち上がる。
 * 単体で起動する場合は `bun run dev:proxy`。
 */
import {
  buildCorsHeaders,
  proxyCalibreRequest,
  resolveCalibreTarget,
} from "../src-electrobun/calibreProxy"

const hostname = "127.0.0.1"

export type CalibreProxyDevServerOptions = {
  port?: number
}

export function startCalibreProxyDevServer(options: CalibreProxyDevServerOptions = {}) {
  const port = options.port ?? Number(process.env.CALIBRE_PROXY_PORT ?? 8082)

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid CALIBRE_PROXY_PORT: ${process.env.CALIBRE_PROXY_PORT}`)
  }

  return Bun.serve({
    hostname,
    port,
    async fetch(request) {
      const target = resolveCalibreTarget(request.url)
      if (!target) {
        // CORS ヘッダーを付けないと、パス誤りがブラウザ側で CORS エラーに見える。
        return new Response("Not a Calibre proxy request", {
          status: 404,
          headers: buildCorsHeaders(request),
        })
      }

      return proxyCalibreRequest(request, target)
    },
  })
}

if (import.meta.main) {
  try {
    const server = startCalibreProxyDevServer()
    console.log(`Calibre dev proxy listening on http://${hostname}:${server.port}`)
    console.log(
      `For a separate Metro: EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN=http://${hostname}:${server.port} bun run web:metro`,
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
