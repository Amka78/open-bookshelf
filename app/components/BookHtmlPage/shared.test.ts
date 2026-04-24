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
})

