import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  buildCalibreProxyBase,
  getCalibreProxyOrigin,
  getCalibreRequestBase,
  toCalibreRequestUrl,
  toCalibreUpstreamUrl,
} from "./calibreProxy"

const originalProxyOrigin = window.__ELECTROBUN_PROXY_ORIGIN
const originalElectrobunFlag = window.__ELECTROBUN__
const originalWebProxyFlag = window.__CALIBRE_WEB_PROXY__
const originalDevProxyOrigin = process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN

beforeEach(() => {
  window.__ELECTROBUN_PROXY_ORIGIN = undefined
  window.__ELECTROBUN__ = false
  window.__CALIBRE_WEB_PROXY__ = false
  process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN = ""
})

afterEach(() => {
  window.__ELECTROBUN_PROXY_ORIGIN = originalProxyOrigin
  window.__ELECTROBUN__ = originalElectrobunFlag
  window.__CALIBRE_WEB_PROXY__ = originalWebProxyFlag
  process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN = originalDevProxyOrigin ?? ""
})

describe("getCalibreProxyOrigin", () => {
  test("returns null outside Electrobun", () => {
    expect(getCalibreProxyOrigin()).toBeNull()
  })

  test("uses the origin injected by the Electrobun preload", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234/"

    expect(getCalibreProxyOrigin()).toBe("http://127.0.0.1:41234")
  })

  test("uses the configured proxy origin for web builds", () => {
    process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN = "http://127.0.0.1:8082/"

    expect(getCalibreProxyOrigin()).toBe("http://127.0.0.1:8082")
  })

  test("uses the same origin when the web release flag is injected", () => {
    window.__CALIBRE_WEB_PROXY__ = true

    expect(getCalibreProxyOrigin()).toBe(window.location.origin)
  })
})

describe("buildCalibreProxyBase", () => {
  test("returns null outside Electrobun so the original URL is kept", () => {
    expect(buildCalibreProxyBase("http://calibre.local:8080")).toBeNull()
  })

  test("encodes the Calibre base URL into the local proxy path", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(buildCalibreProxyBase("http://calibre.local:8080/")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%3A8080",
    )
  })

  test("keeps the path part of the Calibre base URL", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(buildCalibreProxyBase("http://calibre.local/calibre")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%2Fcalibre",
    )
  })

  test("returns null for an empty base URL", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(buildCalibreProxyBase("   ")).toBeNull()
  })

  test("builds the proxy base from the dev proxy origin", () => {
    process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN = "http://127.0.0.1:8082"

    expect(buildCalibreProxyBase("http://calibre.local:8080")).toBe(
      "http://127.0.0.1:8082/__calibre/http%3A%2F%2Fcalibre.local%3A8080",
    )
  })
})

describe("getCalibreRequestBase", () => {
  test("returns the original URL outside Electrobun", () => {
    expect(getCalibreRequestBase("http://calibre.local:8080/")).toBe("http://calibre.local:8080")
  })

  test("returns the proxy URL inside Electrobun", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(getCalibreRequestBase("http://calibre.local:8080")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%3A8080",
    )
  })
})

describe("toCalibreRequestUrl", () => {
  const originalBase = "http://calibre.local:8080"

  test("proxies a relative path", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(toCalibreRequestUrl(originalBase, "/get/thumb/1/lib")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%3A8080/get/thumb/1/lib",
    )
  })

  test("proxies an absolute URL under the base URL", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(toCalibreRequestUrl(originalBase, "http://calibre.local:8080/get/1")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%3A8080/get/1",
    )
  })

  test("keeps the path of the base URL", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(toCalibreRequestUrl("http://calibre.local/calibre", "/get/1")).toBe(
      "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%2Fcalibre/get/1",
    )
    expect(
      toCalibreRequestUrl("http://calibre.local/calibre", "http://calibre.local/calibre/get/1"),
    ).toBe("http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%2Fcalibre/get/1")
  })

  test("proxies same-origin URLs outside the base path through the origin", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(
      toCalibreRequestUrl("http://calibre.local/calibre", "http://calibre.local/opds/icon.png"),
    ).toBe("http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local/opds/icon.png")
  })

  test("leaves external, special and already proxied URLs unchanged", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(toCalibreRequestUrl(originalBase, "https://example.com/icon.png")).toBe(
      "https://example.com/icon.png",
    )
    expect(toCalibreRequestUrl(originalBase, "data:image/png;base64,abc")).toBe(
      "data:image/png;base64,abc",
    )
    expect(toCalibreRequestUrl(originalBase, "blob:http://localhost/abc")).toBe(
      "blob:http://localhost/abc",
    )
    expect(toCalibreRequestUrl(originalBase, "ftp://example.com/book.epub")).toBe(
      "ftp://example.com/book.epub",
    )

    const proxyUrl = `${getCalibreRequestBase(originalBase)}/get/1`
    expect(toCalibreRequestUrl(originalBase, proxyUrl)).toBe(proxyUrl)
  })

  test("returns the original URL when no proxy is configured", () => {
    expect(toCalibreRequestUrl(originalBase, "http://calibre.local:8080/get/1")).toBe(
      "http://calibre.local:8080/get/1",
    )
    expect(toCalibreRequestUrl(originalBase, "get/1")).toBe("http://calibre.local:8080/get/1")
    expect(toCalibreRequestUrl("http://calibre.local/calibre", "/get/1")).toBe(
      "http://calibre.local/calibre/get/1",
    )
  })
})

describe("toCalibreUpstreamUrl", () => {
  const proxyBase = "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local%3A8080"
  const originalBase = "http://calibre.local:8080"

  test("restores the upstream URL for Digest uri calculation", () => {
    expect(
      toCalibreUpstreamUrl(
        `${proxyBase}/book-file/1/EPUB/10/20/Text/chapter.xhtml`,
        proxyBase,
        originalBase,
      ),
    ).toBe("http://calibre.local:8080/book-file/1/EPUB/10/20/Text/chapter.xhtml")
  })

  test("restores a proxy URL built for the origin", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234"

    expect(
      toCalibreUpstreamUrl(
        "http://127.0.0.1:41234/__calibre/http%3A%2F%2Fcalibre.local/opds/icon.png",
        null,
        null,
      ),
    ).toBe("http://calibre.local/opds/icon.png")
  })

  test("leaves non-proxied URLs untouched", () => {
    expect(toCalibreUpstreamUrl("http://calibre.local:8080/get/x", proxyBase, originalBase)).toBe(
      "http://calibre.local:8080/get/x",
    )
  })

  test("leaves relative URLs untouched", () => {
    expect(toCalibreUpstreamUrl("/interface-data/init", proxyBase, originalBase)).toBe(
      "/interface-data/init",
    )
  })
})
