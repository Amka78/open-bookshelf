import { afterEach, describe, expect, test, vi } from "vitest"
import {
  CALIBRE_PROXY_PREFIX,
  proxyCalibreRequest,
  resolveCalibreTarget,
} from "../src-electrobun/calibreProxy"

const originalBase = "http://calibre.local:8080"
const encodedBase = encodeURIComponent(originalBase)
const proxyUrl = (path: string) =>
  `http://127.0.0.1:41234${CALIBRE_PROXY_PREFIX}${encodedBase}${path}`

describe("resolveCalibreTarget", () => {
  test("resolves a proxied path to the upstream URL", () => {
    const target = resolveCalibreTarget(proxyUrl("/interface-data/init?x=1"))

    expect(target?.href).toBe("http://calibre.local:8080/interface-data/init?x=1")
  })

  test("keeps the path of the configured base URL", () => {
    const encoded = encodeURIComponent("http://calibre.local/calibre")
    const target = resolveCalibreTarget(
      `http://127.0.0.1:41234${CALIBRE_PROXY_PREFIX}${encoded}/get/thumb/1/lib`,
    )

    expect(target?.href).toBe("http://calibre.local/calibre/get/thumb/1/lib")
  })

  test("resolves the proxy root to the base URL root", () => {
    const target = resolveCalibreTarget(
      `http://127.0.0.1:41234${CALIBRE_PROXY_PREFIX}${encodedBase}`,
    )

    expect(target?.href).toBe("http://calibre.local:8080/")
  })

  test("preserves encoded path segments", () => {
    const target = resolveCalibreTarget(proxyUrl("/get/thumb/1/lib%20one?sz=300x400"))

    expect(target?.pathname).toBe("/get/thumb/1/lib%20one")
    expect(target?.search).toBe("?sz=300x400")
  })

  test("ignores non-proxy paths", () => {
    expect(resolveCalibreTarget("http://127.0.0.1:41234/_expo/static/js/web/index.js")).toBeNull()
  })

  test("rejects non-http protocols", () => {
    const encoded = encodeURIComponent("file:///etc/passwd")
    expect(
      resolveCalibreTarget(`http://127.0.0.1:41234${CALIBRE_PROXY_PREFIX}${encoded}/x`),
    ).toBeNull()
  })

  test("rejects malformed base URLs", () => {
    expect(
      resolveCalibreTarget(`http://127.0.0.1:41234${CALIBRE_PROXY_PREFIX}%E0%A4%A/x`),
    ).toBeNull()
  })
})

describe("proxyCalibreRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("forwards the request and exposes the auth challenge to the WebView", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", {
        status: 401,
        headers: {
          "content-type": "application/json",
          "www-authenticate": 'Digest realm="calibre", nonce="abc"',
          "content-encoding": "gzip",
          "content-length": "2",
        },
      }),
    )
    const target = resolveCalibreTarget(proxyUrl("/interface-data/init?x=1"))
    const request = new Request(proxyUrl("/interface-data/init?x=1"), {
      headers: {
        Authorization: "Basic dXNlcjpwYXNz",
        Origin: "http://localhost:8081",
      },
    })

    const response = await proxyCalibreRequest(request, target!)

    expect(response.status).toBe(401)
    expect(response.headers.get("www-authenticate")).toContain("Digest")
    expect(response.headers.get("access-control-allow-origin")).toBe("*")
    expect(response.headers.get("access-control-expose-headers")).toContain("WWW-Authenticate")
    expect(response.headers.get("content-encoding")).toBeNull()
    expect(response.headers.get("content-length")).toBeNull()

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.href).toBe("http://calibre.local:8080/interface-data/init?x=1")
    expect((init.headers as Headers).get("authorization")).toBe("Basic dXNlcjpwYXNz")
    expect((init.headers as Headers).get("origin")).toBeNull()
  })

  test("answers CORS preflight without calling the upstream", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
    const target = resolveCalibreTarget(proxyUrl("/interface-data/init"))
    const request = new Request(proxyUrl("/interface-data/init"), {
      method: "OPTIONS",
      headers: {
        "access-control-request-headers": "authorization, content-type",
      },
    })

    const response = await proxyCalibreRequest(request, target!)

    expect(response.status).toBe(204)
    expect(response.headers.get("access-control-allow-headers")).toBe("authorization, content-type")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test("returns 502 when the upstream is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"))
    const target = resolveCalibreTarget(proxyUrl("/interface-data/init"))

    const response = await proxyCalibreRequest(
      new Request(proxyUrl("/interface-data/init")),
      target!,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get("access-control-allow-origin")).toBe("*")
  })
})
