/**
 * Bun 側で /__calibre/<エンコードしたベースURL>/<path> を上流 URL に解決する。
 * 副作用を持たせず、単体テストできるようにしている。
 */

export const CALIBRE_PROXY_PREFIX = "/__calibre/"

export type CalibreProxyOptions = {
  /**
   * 上流 fetch のリダイレクト挙動。公開プロキシでは "error" にして、
   * 許可リストを迂回した別ホストへの転送を防ぐ。
   */
  redirect?: RequestRedirect
}

function normalizeAllowedHost(entry: string): string {
  return entry
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
}

/**
 * CALIBRE_PROXY_ALLOWED_HOSTS の値を解析する。
 * カンマ区切りの host / host:port（スキームやパスは無視）を受け付ける。
 */
export function parseAllowedCalibreHosts(value: string | undefined): string[] {
  if (!value) return []

  return value.split(",").map(normalizeAllowedHost).filter(Boolean)
}

/**
 * 上流 URL が許可リストに含まれるか。許可リストが空なら全ホストを許可する。
 */
export function isAllowedCalibreHost(target: URL, allowedHosts: string[]): boolean {
  if (allowedHosts.length === 0) return true

  const host = target.host.toLowerCase()
  const hostname = target.hostname.toLowerCase()
  return allowedHosts.some((allowed) => allowed === host || allowed === hostname)
}

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

export function buildCorsHeaders(request: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      request.headers.get("access-control-request-headers") ?? "Authorization, Content-Type",
    "Access-Control-Expose-Headers":
      "WWW-Authenticate, X-Calibre-WWW-Authenticate, Content-Disposition, Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified",
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
export async function proxyCalibreRequest(
  request: Request,
  target: URL,
  options: CalibreProxyOptions = {},
): Promise<Response> {
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
      redirect: options.redirect ?? "follow",
      ...(hasBody ? { duplex: "half" } : {}),
    } as RequestInit)

    const responseHeaders = new Headers()
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return
      responseHeaders.set(key, value)
    })

    // 同一オリジンの WebView は 401 + WWW-Authenticate を自前の認証ダイアログで
    // 処理してしまい、アプリの 401 ハンドラ（Digest/Basic の選択）に届かない。
    // チャレンジは独自ヘッダーで渡し、WebView には認証チャレンジを見せない。
    const authChallenge = responseHeaders.get("www-authenticate")
    if (authChallenge) {
      responseHeaders.delete("www-authenticate")
      responseHeaders.set("x-calibre-www-authenticate", authChallenge)
    }

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
