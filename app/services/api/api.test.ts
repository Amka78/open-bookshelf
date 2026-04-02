import { beforeEach, describe, expect, jest, test } from "bun:test"
import { Api } from "./api"

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
})
