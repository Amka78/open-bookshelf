import { beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { renderHook, waitFor } from "@testing-library/react"

const fetchWithAuthMock = jest.fn()
const getBookFileUrlMock = jest.fn(
  (bookId: number, format: string, size: number, hash: number, path: string, libraryId: string) => {
    return `http://calibrelocal/book-file/${bookId}/${format}/${size}/${hash}/${path}?library_id=${libraryId}`
  },
)

mock.module("@/services/api", () => ({
  api: {
    fetchWithAuth: (...args: Parameters<typeof fetchWithAuthMock>) => fetchWithAuthMock(...args),
    getBookFileUrl: (...args: Parameters<typeof getBookFileUrlMock>) => getBookFileUrlMock(...args),
    loadOPDS: jest.fn(),
    syncReadingPosition: jest.fn().mockResolvedValue(undefined),
    syncReadingPositionFull: jest.fn().mockResolvedValue(undefined),
  },
}))

mock.module("/home/amka78/open-bookshelf/app/services/api/index.ts", () => ({
  api: {
    fetchWithAuth: (...args: Parameters<typeof fetchWithAuthMock>) => fetchWithAuthMock(...args),
    getBookFileUrl: (...args: Parameters<typeof getBookFileUrlMock>) => getBookFileUrlMock(...args),
    loadOPDS: jest.fn(),
    syncReadingPosition: jest.fn().mockResolvedValue(undefined),
    syncReadingPositionFull: jest.fn().mockResolvedValue(undefined),
  },
}))

let useCalibreHtmlDocument: typeof import("./shared").useCalibreHtmlDocument

const createResponse = ({
  body,
  contentType,
  status = 200,
}: {
  body: string | Uint8Array
  contentType: string
  status?: number
}) => {
  const bodyBytes = typeof body === "string" ? new TextEncoder().encode(body) : body

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => {
        return name.toLowerCase() === "content-type" ? contentType : null
      },
    },
    text: async () => {
      return typeof body === "string" ? body : new TextDecoder().decode(body)
    },
    arrayBuffer: async () => {
      return bodyBytes.buffer.slice(
        bodyBytes.byteOffset,
        bodyBytes.byteOffset + bodyBytes.byteLength,
      )
    },
  } as Response
}

const createBookHtmlProps = (
  overrides: Partial<{
    libraryId: string
    bookId: number
    format: string
    size: number
    hash: number
    pagePath: string
    headers: Record<string, string>
  }> = {},
) => ({
  libraryId: "config",
  bookId: 8315,
  format: "EPUB",
  size: 49184264,
  hash: 17749658580,
  pagePath: "Text/chapter.xhtml",
  headers: { Authorization: "Digest page-only" },
  ...overrides,
})

const encodeVirtualizedPath = (path: string) => {
  return Buffer.from(path, "utf8").toString("base64")
}

beforeAll(async () => {
  ;({ useCalibreHtmlDocument } = await import("./shared"))
})

describe("useCalibreHtmlDocument", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("BookHtmlPage should load resources through api.fetchWithAuth")
    })
  })

  test("loads serialized html resources through api.fetchWithAuth for each book asset", async () => {
    fetchWithAuthMock.mockImplementation((url: string) => {
      if (url.includes("Text/chapter.xhtml")) {
        return Promise.resolve(
          createResponse({
            body: JSON.stringify({
              ns_map: [],
              tree: {
                n: "html",
                c: [
                  {
                    n: "body",
                    c: [
                      {
                        n: "img",
                        a: [["src", "OPS/pages/image029.jpg"]],
                      },
                    ],
                  },
                ],
              },
            }),
            contentType: "application/json",
          }),
        )
      }

      if (url.includes("OPS/pages/image029.jpg")) {
        return Promise.resolve(
          createResponse({
            body: new Uint8Array([255, 216, 255, 217]),
            contentType: "image/jpeg",
          }),
        )
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const { result } = renderHook(() =>
      useCalibreHtmlDocument({
        libraryId: "config",
        bookId: 8315,
        format: "EPUB",
        size: 49184264,
        hash: 17749658580,
        pagePath: "Text/chapter.xhtml",
        headers: { Authorization: "Digest page-only" },
      }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.html).toContain("data:image/jpeg;base64,")
    expect(fetchWithAuthMock).toHaveBeenCalledTimes(2)
    expect(fetchWithAuthMock.mock.calls[0]?.[0]).toContain("Text/chapter.xhtml")
    expect(fetchWithAuthMock.mock.calls[1]?.[0]).toContain("OPS/pages/image029.jpg")
  })

  test("retries stylesheet candidates when the first resource response is not ok", async () => {
    const encodedStylesheetPath = encodeVirtualizedPath("Styles/book.css")

    fetchWithAuthMock.mockImplementation((url: string) => {
      if (url.includes("Text/chapter-styles.xhtml")) {
        return Promise.resolve(
          createResponse({
            body: JSON.stringify({
              ns_map: [],
              tree: {
                n: "html",
                c: [
                  {
                    n: "head",
                    c: [
                      {
                        n: "link",
                        a: [
                          ["rel", "stylesheet"],
                          ["href", `../fallback|${encodedStylesheetPath}|`],
                        ],
                      },
                    ],
                  },
                  {
                    n: "body",
                    c: [{ n: "p", c: ["hello"] }],
                  },
                ],
              },
            }),
            contentType: "application/json",
          }),
        )
      }

      if (url.includes("/../Styles/book.css?")) {
        return Promise.resolve(
          createResponse({
            body: "body { writing-mode: vertical-rl; }",
            contentType: "text/css",
          }),
        )
      }

      if (url.includes("/Styles/book.css?")) {
        return Promise.resolve(
          createResponse({
            body: "missing",
            contentType: "text/plain",
            status: 404,
          }),
        )
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const { result } = renderHook(() =>
      useCalibreHtmlDocument(
        createBookHtmlProps({ pagePath: "Text/chapter-styles.xhtml", hash: 17749658581 }),
      ),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.html).toContain("data:text/css;charset=utf-8,")
    expect(result.current.html).toContain("writing-mode%3A%20vertical-rl")
    expect(fetchWithAuthMock).toHaveBeenCalledTimes(3)
    expect(fetchWithAuthMock.mock.calls[1]?.[0]).toContain("/Styles/book.css?")
    expect(fetchWithAuthMock.mock.calls[2]?.[0]).toContain("/../Styles/book.css?")
  })

  test("keeps an inlined stylesheet when a nested css resource cannot be loaded", async () => {
    const encodedStylesheetPath = encodeVirtualizedPath("Styles/book-with-font.css")

    fetchWithAuthMock.mockImplementation((url: string) => {
      if (url.includes("Text/chapter-fonts.xhtml")) {
        return Promise.resolve(
          createResponse({
            body: JSON.stringify({
              ns_map: [],
              tree: {
                n: "html",
                c: [
                  {
                    n: "head",
                    c: [
                      {
                        n: "link",
                        a: [
                          ["rel", "stylesheet"],
                          ["href", `fallback|${encodedStylesheetPath}|`],
                        ],
                      },
                    ],
                  },
                  {
                    n: "body",
                    c: [{ n: "p", c: ["hello"] }],
                  },
                ],
              },
            }),
            contentType: "application/json",
          }),
        )
      }

      if (url.includes("/Styles/book-with-font.css?")) {
        return Promise.resolve(
          createResponse({
            body: '@font-face { font-family: "Missing"; src: url("../Fonts/missing.ttf"); } body { writing-mode: vertical-rl; }',
            contentType: "text/css",
          }),
        )
      }

      if (url.includes("/Fonts/missing.ttf?")) {
        return Promise.resolve(
          createResponse({
            body: "missing",
            contentType: "text/plain",
            status: 404,
          }),
        )
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const { result } = renderHook(() =>
      useCalibreHtmlDocument(
        createBookHtmlProps({ pagePath: "Text/chapter-fonts.xhtml", hash: 17749658583 }),
      ),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.html).toContain("data:text/css;charset=utf-8,")
    expect(result.current.html).toContain("writing-mode%3A%20vertical-rl")
    expect(result.current.html).toContain("..%2FFonts%2Fmissing.ttf")
    expect(fetchWithAuthMock).toHaveBeenCalledTimes(3)
  })

  test("preserves the original resource attribute when inlining fails", async () => {
    fetchWithAuthMock.mockImplementation((url: string) => {
      if (url.includes("Text/chapter-missing-image.xhtml")) {
        return Promise.resolve(
          createResponse({
            body: JSON.stringify({
              ns_map: [],
              tree: {
                n: "html",
                c: [
                  {
                    n: "body",
                    c: [
                      {
                        n: "img",
                        a: [["src", "../Images/missing.jpg"]],
                      },
                    ],
                  },
                ],
              },
            }),
            contentType: "application/json",
          }),
        )
      }

      if (url.includes("/Images/missing.jpg?")) {
        return Promise.resolve(
          createResponse({
            body: "missing",
            contentType: "text/plain",
            status: 404,
          }),
        )
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const { result } = renderHook(() =>
      useCalibreHtmlDocument(
        createBookHtmlProps({ pagePath: "Text/chapter-missing-image.xhtml", hash: 17749658584 }),
      ),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.html).toContain("../Images/missing.jpg")
    expect(result.current.html).not.toContain('["src",null]')
    expect(fetchWithAuthMock).toHaveBeenCalledTimes(2)
  })

  test("surfaces a fetch error when the serialized page response is not ok", async () => {
    fetchWithAuthMock.mockResolvedValue(
      createResponse({
        body: "missing",
        contentType: "text/plain",
        status: 404,
      }),
    )

    const { result } = renderHook(() =>
      useCalibreHtmlDocument(createBookHtmlProps({ pagePath: "Text/missing.xhtml", hash: 17749658582 })),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.html).toBeNull()
    expect(result.current.error).toContain("Failed to fetch book resource: Text/missing.xhtml (404)")
  })
})
