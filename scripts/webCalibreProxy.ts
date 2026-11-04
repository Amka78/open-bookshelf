/**
 * Web リリース（Docker）用の Calibre プロキシ。
 *
 * nginx が TLS と静的配信を担当し、`/__calibre/...` だけをこのプロセスへ転送する。
 * 外部公開を想定するため、CALIBRE_PROXY_ALLOWED_HOSTS で上流を制限できる。
 * 許可リストが空の場合は全ホストを許可する（LAN 専用なら空でもよい）。
 */
import {
  isAllowedCalibreHost,
  parseAllowedCalibreHosts,
  proxyCalibreRequest,
  resolveCalibreTarget,
} from "../src-electrobun/calibreProxy"

const hostname = "127.0.0.1"
const port = Number(process.env.CALIBRE_PROXY_PORT ?? 8082)
const allowedHosts = parseAllowedCalibreHosts(process.env.CALIBRE_PROXY_ALLOWED_HOSTS)

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`[calibre-proxy] Invalid CALIBRE_PROXY_PORT: ${process.env.CALIBRE_PROXY_PORT}`)
  process.exit(1)
}

if (allowedHosts.length === 0) {
  console.warn(
    "[calibre-proxy] CALIBRE_PROXY_ALLOWED_HOSTS is empty: any http(s) host can be proxied. " +
      "Set it when this server is publicly reachable.",
  )
}

const server = Bun.serve({
  hostname,
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (pathname === "/__calibre/health") {
      return new Response("ok")
    }

    const target = resolveCalibreTarget(request.url)
    if (!target) {
      return new Response("Not a Calibre proxy request", { status: 404 })
    }

    if (!isAllowedCalibreHost(target, allowedHosts)) {
      console.warn(`[calibre-proxy] blocked target: ${target.host}`)
      return new Response("Calibre proxy target is not allowed", { status: 403 })
    }

    // リダイレクトを追うと許可リストを迂回できるため、公開プロキシでは追跡しない。
    return proxyCalibreRequest(request, target, { redirect: "error" })
  },
})

console.log(`[calibre-proxy] listening on http://${hostname}:${server.port}`)
console.log(
  `[calibre-proxy] allowed hosts: ${allowedHosts.length ? allowedHosts.join(", ") : "(any)"}`,
)
