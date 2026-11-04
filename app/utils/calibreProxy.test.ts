import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  buildCalibreProxyBase,
  getCalibreProxyOrigin,
  getCalibreRequestBase,
  toCalibreUpstreamUrl,
} from "./calibreProxy"

const originalProxyOrigin = window.__ELECTROBUN_PROXY_ORIGIN
const originalElectrobunFlag = window.__ELECTROBUN__

beforeEach(() => {
  window.__ELECTROBUN_PROXY_ORIGIN = undefined
  window.__ELECTROBUN__ = false
})

afterEach(() => {
  window.__ELECTROBUN_PROXY_ORIGIN = originalProxyOrigin
  window.__ELECTROBUN__ = originalElectrobunFlag
})

describe("getCalibreProxyOrigin", () => {
  test("returns null outside Electrobun", () => {
    expect(getCalibreProxyOrigin()).toBeNull()
  })

  test("uses the origin injected by the Electrobun preload", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = "http://127.0.0.1:41234/"

    expect(getCalibreProxyOrigin()).toBe("http://127.0.0.1:41234")
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
