import type { ApiResponse } from "apisauce"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { Api } from "./api"

describe("Api.startConversion", () => {
  test("sends options as a nested object under the 'options' key", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: true,
      status: 200,
      data: 42,
      problem: null,
    } as never)

    await api.startConversion("config", 8618, "EPUB", "AZW3", { margin_top: 5 })

    expect(postSpy).toHaveBeenCalledTimes(1)
    const [url, body] = postSpy.mock.calls[0] as [string, unknown]
    expect(url).toBe("conversion/start/8618?library_id=config")
    expect(body).toEqual({
      input_fmt: "EPUB",
      output_fmt: "AZW3",
      options: { margin_top: 5 },
    })
  })

  test("sends empty options object when no convertParams provided", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: true,
      status: 200,
      data: 99,
      problem: null,
    } as never)

    await api.startConversion("mylib", 100, "PDF", "EPUB")

    const [url, body] = postSpy.mock.calls[0] as [string, unknown]
    expect(url).toBe("conversion/start/100?library_id=mylib")
    expect(body).toEqual({ input_fmt: "PDF", output_fmt: "EPUB", options: {} })
  })

  test("returns job id from response data", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: true,
      status: 200,
      data: 42,
      problem: null,
    } as never)

    const result = await api.startConversion("config", 8618, "EPUB", "AZW3")
    expect(result).toEqual({ kind: "ok", data: 42 })
  })

  test("returns not-found problem on 404", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: false,
      status: 404,
      data: "Book not found",
      problem: "CLIENT_ERROR",
    } as never)

    const result = await api.startConversion("config", 9999, "EPUB", "AZW3")
    expect(result).toEqual({ kind: "not-found", message: "Book not found" })
  })
})

describe("Api.fetchWithAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test("uses URL-specific Digest authorization headers for each fetch", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setCredentials("reader", "secret", "cmVhZGVyOnNlY3JldA==")

    const internalApi = api as Api & {
      authMethod: "digest" | "basic" | null
      digestChallenge: { realm: string; nonce: string; qop?: string; algorithm?: string } | null
    }
    internalApi.authMethod = "digest"
    internalApi.digestChallenge = {
      realm: "calibre",
      nonce: "nonce-123",
      qop: "auth",
      algorithm: "MD5",
    }

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200 } as Response)

    await api.fetchWithAuth("http://calibrelocal/book-file/1/EPUB/10/20/Text/chapter.xhtml")
    await api.fetchWithAuth("http://calibrelocal/book-file/1/EPUB/10/20/OPS/pages/image029.jpg")

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstRequest = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const secondRequest = fetchMock.mock.calls[1]?.[1] as RequestInit | undefined
    const firstAuthorization = (firstRequest?.headers as Record<string, string>)?.Authorization
    const secondAuthorization = (secondRequest?.headers as Record<string, string>)?.Authorization

    expect(firstAuthorization).toContain('uri="/book-file/1/EPUB/10/20/Text/chapter.xhtml"')
    expect(secondAuthorization).toContain('uri="/book-file/1/EPUB/10/20/OPS/pages/image029.jpg"')
    expect(firstAuthorization).not.toBe(secondAuthorization)
  })

  test("uploadFile uses auth-aware fetch for Digest-protected uploads", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const fetchWithAuthSpy = vi
      .spyOn(api, "fetchWithAuth")
      .mockResolvedValue({ ok: true, status: 200 } as Response)

    await api.uploadFile("sample.epub", "config", new File(["book"], "sample.epub"))

    expect(fetchWithAuthSpy).toHaveBeenCalledTimes(1)
    expect(fetchWithAuthSpy).toHaveBeenCalledWith(
      "http://calibrelocal/cdb/add-book/0/n/sample.epub/config",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("editBook sends removed_formats via cdb/set-fields", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
      problem: null,
    } as never)

    const result = await api.editBook("config", 12, {
      changes: { removed_formats: ["EPUB"] } as never,
      loaded_book_ids: [12],
    })

    expect(result).toEqual({ kind: "ok", data: {} })
    expect(postSpy).toHaveBeenCalledWith("cdb/set-fields/12/config", {
      changes: { removed_formats: ["EPUB"] },
      loaded_book_ids: [12],
    })
  })

  test("editBook sends added_formats via cdb/set-fields", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = vi.spyOn(api.apisauce, "post").mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
      problem: null,
    } as never)

    const addedFormat = {
      ext: "PDF",
      data_url: "data:application/pdf;base64,abc123",
      name: "book.pdf",
      size: 1234,
      type: "application/pdf",
    }

    const result = await api.editBook("config", 12, {
      changes: { added_formats: [addedFormat] } as never,
      loaded_book_ids: [12],
    })

    expect(result).toEqual({ kind: "ok", data: {} })
    expect(postSpy).toHaveBeenCalledWith("cdb/set-fields/12/config", {
      changes: { added_formats: [addedFormat] },
      loaded_book_ids: [12],
    })
  })

  test("setCoverBinary posts image blob via apisauce to cdb/set-cover", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = vi
      .spyOn(api.apisauce, "post")
      .mockResolvedValueOnce({ ok: true, status: 200, data: null } as ApiResponse<unknown>)

    const imageBlob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" })
    const result = await api.setCoverBinary("config", 8578, imageBlob)

    expect(result).toEqual({ kind: "ok" })
    expect(postSpy).toHaveBeenCalledWith(
      "cdb/set-cover/8578/config",
      expect.any(Uint8Array),
      expect.objectContaining({
        headers: { "Content-Type": "image/png" },
      }),
    )
  })

  test("setCoverBinary returns server error when server responds with 500", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    // biome-ignore lint/complexity/useLiteralKeys: accessing private apisauce for test spy
    vi.spyOn(api["apisauce"], "post").mockResolvedValueOnce({
      ok: false,
      status: 500,
      problem: "SERVER_ERROR",
      data: "Internal Server Error",
    } as ApiResponse<unknown>)

    const imageBlob = new Blob([new Uint8Array([255, 216, 255])], { type: "image/jpeg" })
    const result = await api.setCoverBinary("config", 8578, imageBlob)

    expect(result).toEqual({ kind: "server" })
  })

  test("setCoverBinary returns unauthorized on 401", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    // biome-ignore lint/complexity/useLiteralKeys: accessing private apisauce for test spy
    vi.spyOn(api["apisauce"], "post").mockResolvedValueOnce({
      ok: false,
      status: 401,
      problem: "CLIENT_ERROR",
      data: "Unauthorized",
    } as ApiResponse<unknown>)

    const imageBlob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" })
    const result = await api.setCoverBinary("config", 8578, imageBlob)

    expect(result).toEqual({ kind: "unauthorized" })
  })
})

describe("Api with the Electrobun Calibre proxy", () => {
  const originalProxyOrigin = window.__ELECTROBUN_PROXY_ORIGIN
  const proxyOrigin = "http://127.0.0.1:41234"
  const proxyBase = `${proxyOrigin}/__calibre/${encodeURIComponent("http://calibrelocal")}`

  beforeEach(() => {
    window.__ELECTROBUN_PROXY_ORIGIN = proxyOrigin
  })

  afterEach(() => {
    window.__ELECTROBUN_PROXY_ORIGIN = originalProxyOrigin
    vi.restoreAllMocks()
  })

  test("builds same-origin URLs for API calls, thumbnails and downloads", () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal/")

    expect(api.getBookThumbnailUrl(1, "lib")).toBe(`${proxyBase}/get/thumb/1/lib?sz=300x400`)
    expect(api.getInlineBookUrl("EPUB", 1, "lib")).toBe(
      `${proxyBase}/get/EPUB/1/lib?content_disposition=inline`,
    )
  })

  test("uploadFile sends the POST to the proxy base", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }))

    const result = await api.uploadFile("test.epub", "lib", new File(["book"], "test.epub"))

    expect(result).toEqual({ kind: "ok" })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${proxyBase}/cdb/add-book/0/n/test.epub/lib`)
    expect(init.method).toBe("POST")
    expect(init.body).toBeInstanceOf(FormData)
    // FormData ではブラウザに multipart の boundary を付けさせるため、
    // apisauce の application/json をそのまま渡さない。
    const headers = init.headers as Record<string, string>
    expect(headers["Content-Type"]).toBeUndefined()
    expect(headers.Accept).toBe("application/atom+xml")
  })

  test("uploadFile encodes file and library names in the proxy URL", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }))

    await api.uploadFile("テスト 本.epub", "calibre library", new File(["book"], "テスト.epub"))

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      `${proxyBase}/cdb/add-book/0/n/${encodeURIComponent("テスト 本.epub")}/${encodeURIComponent(
        "calibre library",
      )}`,
    )
  })

  test("fetchWithAuth proxies an upstream URL", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }))

    await api.fetchWithAuth("http://calibrelocal/get/thumb/1/lib")

    expect(fetchSpy.mock.calls[0]?.[0]).toBe(`${proxyBase}/get/thumb/1/lib`)
  })

  test("loadOPDS proxies an absolute upstream URL", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")
    const getSpy = vi.spyOn(api.apisauce, "get").mockResolvedValue({
      ok: true,
      status: 200,
      data: "<feed />",
      problem: null,
    } as never)

    await api.loadOPDS("http://calibrelocal/opds")

    expect(getSpy).toHaveBeenCalledWith(`${proxyBase}/opds`)
  })

  test("encodes only path segments so the proxy base is not double-encoded", () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")

    const fileUrl = api.getBookFileUrl(1, "EPUB", 10, 20, "OPS/pages/image 01.jpg", "lib")
    expect(fileUrl).toBe(
      `${proxyBase}/book-file/1/EPUB/10/20/OPS/pages/image%2001.jpg?library_id=lib`,
    )
    expect(fileUrl).not.toContain("%253A")

    expect(api.getBookThumbnailUrl(1, "calibre library")).toBe(
      `${proxyBase}/get/thumb/1/calibre%20library?sz=300x400`,
    )
  })

  test("keeps the upstream path in Digest authorization headers", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")
    api.setCredentials("reader", "secret", "cmVhZGVyOnNlY3JldA==")

    const internalApi = api as Api & {
      authMethod: "digest" | "basic" | null
      digestChallenge: { realm: string; nonce: string; qop?: string; algorithm?: string } | null
    }
    internalApi.authMethod = "digest"
    internalApi.digestChallenge = {
      realm: "calibre",
      nonce: "nonce-123",
      qop: "auth",
      algorithm: "MD5",
    }

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200 } as Response)

    await api.fetchWithAuth(`${proxyBase}/book-file/1/EPUB/10/20/Text/chapter.xhtml`)

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const authorization = (request?.headers as Record<string, string>)?.Authorization

    expect(authorization).toContain('uri="/book-file/1/EPUB/10/20/Text/chapter.xhtml"')
    expect(authorization).not.toContain("__calibre")
  })

  test("keeps the base path in Digest authorization headers", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal/calibre" })
    api.setUrl("http://calibrelocal/calibre")
    api.setCredentials("reader", "secret", "cmVhZGVyOnNlY3JldA==")

    const internalApi = api as Api & {
      authMethod: "digest" | "basic" | null
      digestChallenge: { realm: string; nonce: string; qop?: string; algorithm?: string } | null
    }
    internalApi.authMethod = "digest"
    internalApi.digestChallenge = {
      realm: "calibre",
      nonce: "nonce-123",
      qop: "auth",
      algorithm: "MD5",
    }

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200 } as Response)
    const pathProxyBase = `${proxyOrigin}/__calibre/${encodeURIComponent(
      "http://calibrelocal/calibre",
    )}`

    await api.fetchWithAuth(`${pathProxyBase}/book-file/1/EPUB/10/20/Text/chapter.xhtml`)

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const authorization = (request?.headers as Record<string, string>)?.Authorization

    expect(authorization).toContain('uri="/calibre/book-file/1/EPUB/10/20/Text/chapter.xhtml"')
  })

  test("keeps the original URL outside Electrobun", () => {
    window.__ELECTROBUN_PROXY_ORIGIN = undefined
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setUrl("http://calibrelocal")

    expect(api.getBookThumbnailUrl(1, "lib")).toBe("http://calibrelocal/get/thumb/1/lib?sz=300x400")
  })
})

describe("Api auth challenge handling", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("negotiates Digest from X-Calibre-WWW-Authenticate when the standard header is hidden", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    api.setCredentials("reader", "secret", "cmVhZGVyOnNlY3JldA==")

    const authorizations: (string | undefined)[] = []
    const adapter = async (config: unknown) => {
      const headers = (config as { headers?: { get?: (name: string) => unknown } }).headers
      authorizations.push(headers?.get?.("Authorization") as string | undefined)

      if (authorizations.length === 1) {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            status: 401,
            statusText: "Unauthorized",
            headers: {
              "x-calibre-www-authenticate":
                'Digest realm="calibre", nonce="abc", qop="auth", algorithm=MD5',
            },
            data: "Unauthorized",
          },
        })
      }

      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    api.apisauce.axiosInstance.defaults.adapter = adapter as never

    const result = await api.initializeCalibre()

    expect(result.kind).toBe("ok")
    expect(authorizations).toHaveLength(2)
    expect(authorizations[0]).toBeUndefined()
    expect(authorizations[1]).toContain('uri="/interface-data/update')
  })
})
