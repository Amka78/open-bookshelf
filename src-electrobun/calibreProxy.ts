/**
 * Bun 側で /__calibre/<エンコードしたベースURL>/<path> を上流 URL に解決する。
 * 副作用を持たせず、単体テストできるようにしている。
 */

export const CALIBRE_PROXY_PREFIX = "/__calibre/"

const HOP_BY_HOP_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "transfer-encoding",
])

function buildCorsHeaders(request: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      request.headers.get("access-control-request-headers") ?? "Authorization, Content-Type",
    "Access-Control-Expose-Headers":
      "WWW-Authenticate, Content-Disposition, Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified",
    "Access-Control-Max-Age": "600",
  }
}

export function resolveCalibreTarget(requestUrl: string): URL | null {
  let request: URL
  try {
    request = new URL(requestUrl)
  } catch {
    return null
  }

  if (!request.pathname.startsWith(CALIBRE_PROXY_PREFIX)) return null

  const rest = request.pathname.slice(CALIBRE_PROXY_PREFIX.length)
  const slashIndex = rest.indexOf("/")
  const encodedBase = slashIndex === -1 ? rest : rest.slice(0, slashIndex)
  const upstreamPath = slashIndex === -1 ? "/" : rest.slice(slashIndex)
  if (!encodedBase) return null

  let decodedBase: string
  try {
    decodedBase = decodeURIComponent(encodedBase)
  } catch {
    return null
  }

  let base: URL
  try {
    base = new URL(decodedBase)
  } catch {
    return null
  }
  if (base.protocol !== "http:" && base.protocol !== "https:") return null

  const baseWithoutSlash = decodedBase.replace(/\/+$/, "")
  const target = new URL(`${baseWithoutSlash}${upstreamPath}`)
  target.search = request.search
  return target
}

/**
 * Calibre へのリクエストを中継する。WebView から見ると同一オリジンになるため
 * CORS の判定が発生せず、OS ごとの WebView 実装差にも依存しない。
 */
export async function proxyCalibreRequest(request: Request, target: URL): Promise<Response> {
  const cors = buildCorsHeaders(request)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors })
  }

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return
    headers.set(key, value)
  })

  const hasBody = request.method !== "GET" && request.method !== "HEAD"

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "follow",
      ...(hasBody ? { duplex: "half" } : {}),
    } as RequestInit)

    const responseHeaders = new Headers()
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return
      responseHeaders.set(key, value)
    })
    for (const [key, value] of Object.entries(cors)) {
      responseHeaders.set(key, value)
    }

    if (upstream.status === 204 || upstream.status === 304 || request.method === "HEAD") {
      return new Response(null, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      })
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch {
    return new Response("Calibre proxy request failed", { status: 502, headers: cors })
  }
}
