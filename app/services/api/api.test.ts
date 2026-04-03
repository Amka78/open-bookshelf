import { beforeEach, describe, expect, jest, test } from "bun:test"
import type { ApiResponse } from "apisauce"
import { Api } from "./api"

describe("Api.startConversion", () => {
  test("sends options as a nested object under the 'options' key", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const postSpy = jest.spyOn(api.apisauce, "post").mockResolvedValue({
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
    const postSpy = jest.spyOn(api.apisauce, "post").mockResolvedValue({
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
    jest.spyOn(api.apisauce, "post").mockResolvedValue({
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
    jest.spyOn(api.apisauce, "post").mockResolvedValue({
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
    jest.restoreAllMocks()
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

    const fetchMock = jest
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
    const fetchWithAuthSpy = jest
      .spyOn(api, "fetchWithAuth")
      .mockResolvedValue({ ok: true, status: 200 } as Response)

    await api.uploadFile("sample.epub", "config", new File(["book"], "sample.epub"))

    expect(fetchWithAuthSpy).toHaveBeenCalledTimes(1)
    expect(fetchWithAuthSpy).toHaveBeenCalledWith(
      "http://calibrelocal/cdb/add-book/0/n/sample.epub/config",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("uploadBookFormat uses auth-aware fetch for Digest-protected uploads", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    const fetchWithAuthSpy = jest
      .spyOn(api, "fetchWithAuth")
      .mockResolvedValue({ ok: true, status: 200 } as Response)

    await api.uploadBookFormat(
      "config",
      12,
      "EPUB",
      "sample.epub",
      new File(["book"], "sample.epub"),
    )

    expect(fetchWithAuthSpy).toHaveBeenCalledTimes(1)
    expect(fetchWithAuthSpy).toHaveBeenCalledWith(
      "http://calibrelocal/cdb/add-format/12/EPUB/config",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("setCoverBinary posts image blob via apisauce to cdb/set-cover", async () => {
    const api = new Api({ timeout: 1000, url: "http://calibrelocal" })
    // biome-ignore lint/complexity/useLiteralKeys: accessing private apisauce for test spy
    const postSpy = jest
      .spyOn(api["apisauce"], "post")
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
    jest.spyOn(api["apisauce"], "post").mockResolvedValueOnce({
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
    jest.spyOn(api["apisauce"], "post").mockResolvedValueOnce({
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
