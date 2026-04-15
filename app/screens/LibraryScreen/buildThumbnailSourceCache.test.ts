import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import type { Book } from "@/models/calibre"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  buildThumbnailSourceCache,
  type ThumbnailSourceCacheEntry,
} from "./buildThumbnailSourceCache"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

function makeBook(id: number): Pick<Book, "id"> {
  return { id }
}

describe("buildThumbnailSourceCache", () => {
  test("reuses cached image source when auth state and thumbnail uri are unchanged", () => {
    const cachedEntry: ThumbnailSourceCacheEntry = {
      authStateVersion: 3,
      source: {
        uri: "https://example.com/get/thumb/1/main?sz=300x400",
        headers: { Authorization: "Digest cached" },
      },
    }
    const getAuthHeaders = jest.fn(() => ({ Authorization: "Digest new" }))

    const result = buildThumbnailSourceCache({
      authStateVersion: 3,
      bookList: [makeBook(1)],
      getAuthHeaders,
      getBookThumbnailUrl: (bookId, libraryId) =>
        `https://example.com/get/thumb/${bookId}/${libraryId}?sz=300x400`,
      libraryId: "main",
      previousCache: new Map([[1, cachedEntry]]),
    })

    expect(result.get(1)).toBe(cachedEntry)
    expect(getAuthHeaders).not.toHaveBeenCalled()
  })

  test("rebuilds image source when auth state changes", () => {
    const cachedEntry: ThumbnailSourceCacheEntry = {
      authStateVersion: 2,
      source: {
        uri: "https://example.com/get/thumb/1/main?sz=300x400",
        headers: { Authorization: "Digest old" },
      },
    }
    const nextHeaders = { Authorization: "Digest refreshed" }
    const getAuthHeaders = jest.fn(() => nextHeaders)

    const result = buildThumbnailSourceCache({
      authStateVersion: 3,
      bookList: [makeBook(1)],
      getAuthHeaders,
      getBookThumbnailUrl: (bookId, libraryId) =>
        `https://example.com/get/thumb/${bookId}/${libraryId}?sz=300x400`,
      libraryId: "main",
      previousCache: new Map([[1, cachedEntry]]),
    })

    expect(result.get(1)).not.toBe(cachedEntry)
    expect(result.get(1)?.source.headers).toBe(nextHeaders)
    expect(getAuthHeaders).toHaveBeenCalledTimes(1)
  })

  test("rebuilds image source when thumbnail uri changes", () => {
    const cachedEntry: ThumbnailSourceCacheEntry = {
      authStateVersion: 3,
      source: {
        uri: "https://example.com/get/thumb/1/old-library?sz=300x400",
        headers: { Authorization: "Digest old" },
      },
    }
    const nextHeaders = { Authorization: "Digest refreshed" }
    const getAuthHeaders = jest.fn(() => nextHeaders)

    const result = buildThumbnailSourceCache({
      authStateVersion: 3,
      bookList: [makeBook(1)],
      getAuthHeaders,
      getBookThumbnailUrl: (bookId, libraryId) =>
        `https://example.com/get/thumb/${bookId}/${libraryId}?sz=300x400`,
      libraryId: "main",
      previousCache: new Map([[1, cachedEntry]]),
    })

    expect(result.get(1)?.source.uri).toBe("https://example.com/get/thumb/1/main?sz=300x400")
    expect(result.get(1)?.source.headers).toBe(nextHeaders)
    expect(getAuthHeaders).toHaveBeenCalledTimes(1)
  })

  test("rebuilds image source when thumbnail revision changes the uri", () => {
    const cachedEntry: ThumbnailSourceCacheEntry = {
      authStateVersion: 3,
      source: {
        uri: "https://example.com/get/thumb/1/main?sz=300x400&rev=0",
        headers: { Authorization: "Digest old" },
      },
    }
    const nextHeaders = { Authorization: "Digest refreshed" }
    const getAuthHeaders = jest.fn(() => nextHeaders)

    const result = buildThumbnailSourceCache({
      authStateVersion: 3,
      bookList: [makeBook(1)],
      getAuthHeaders,
      getBookThumbnailUrl: (bookId, libraryId) =>
        `https://example.com/get/thumb/${bookId}/${libraryId}?sz=300x400&rev=1`,
      libraryId: "main",
      previousCache: new Map([[1, cachedEntry]]),
    })

    expect(result.get(1)?.source.uri).toBe("https://example.com/get/thumb/1/main?sz=300x400&rev=1")
    expect(result.get(1)?.source.headers).toBe(nextHeaders)
    expect(getAuthHeaders).toHaveBeenCalledTimes(1)
  })
})
