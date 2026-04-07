import { beforeAll, beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

// SearchInputField is a pure UI component — unit-test the underlying token logic
// rather than rendering it (which would require a full Gluestack/React Native env).

describe("getCurrentToken (internal logic)", () => {
  function getCurrentToken(text: string): { prefix: string; token: string } {
    const lastSpace = text.lastIndexOf(" ")
    return lastSpace < 0
      ? { prefix: "", token: text }
      : { prefix: text.slice(0, lastSpace + 1), token: text.slice(lastSpace + 1) }
  }

  test("single token returns empty prefix", () => {
    const result = getCurrentToken("auth")
    expect(result.prefix).toBe("")
    expect(result.token).toBe("auth")
  })

  test("second token has prefix with space", () => {
    const result = getCurrentToken("authors:=Tolkien AND tit")
    expect(result.prefix).toBe("authors:=Tolkien AND ")
    expect(result.token).toBe("tit")
  })

  test("trailing space returns empty token", () => {
    const result = getCurrentToken("authors:=Tolkien ")
    expect(result.prefix).toBe("authors:=Tolkien ")
    expect(result.token).toBe("")
  })

  test("empty string returns empty prefix and token", () => {
    const result = getCurrentToken("")
    expect(result.prefix).toBe("")
    expect(result.token).toBe("")
  })
})

describe("getSearchSuggestions (useLibrary)", () => {
  const mockSearchLibrary = jest.fn().mockResolvedValue(undefined)
  const mockGetTagBrowser = jest.fn()
  const useStoresMock = jest.fn()

  mock.module("@/models", () => ({
    useStores: useStoresMock,
  }))

  mock.module("@/services/api", () => ({
    api: {
      uploadFile: jest.fn(),
    },
  }))

  mock.module("@/hooks/useConvergence", () => ({
    useConvergence: () => ({ isLarge: false }),
  }))

  let useLibrary: typeof import("./useLibrary").useLibrary

  beforeAll(async () => {
    ;({ useLibrary } = await import("./useLibrary"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          searchSetting: { query: "", sort: "title", sortOrder: "desc" },
          fieldMetadataList: new Map([
            ["authors", { searchTerms: ["authors", "author"], isCustom: false }],
            ["title", { searchTerms: ["title"], isCustom: false }],
            ["tags", { searchTerms: ["tags", "tag"], isCustom: false }],
          ]),
          books: new Map(),
          virtualLibraries: [],
        },
        searchLibrary: mockSearchLibrary,
        getTagBrowser: mockGetTagBrowser,
        readingHistories: [],
      },
      settingStore: {
        booksPerPage: 20,
        addRecentSearch: jest.fn(),
      },
    })
  })

  test("returns AND OR NOT plus all field:= suggestions", () => {
    const { result } = renderHook(() => useLibrary())
    const suggestions = result.current.getSearchSuggestions()
    expect(suggestions).toContain("AND")
    expect(suggestions).toContain("OR")
    expect(suggestions).toContain("NOT")
    expect(suggestions).toContain("authors:=")
    expect(suggestions).toContain("title:=")
    expect(suggestions).toContain("tags:=")
  })

  test("does not include 'all' as a suggestion", () => {
    const { result } = renderHook(() => useLibrary())
    const suggestions = result.current.getSearchSuggestions()
    expect(suggestions.some((s) => s.startsWith("all"))).toBe(false)
  })
})
