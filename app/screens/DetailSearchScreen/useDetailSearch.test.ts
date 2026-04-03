import {
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@/components/LeftSideMenu/LeftSideMenu", () => {
  const CATEGORY_ALIASES: Record<string, string> = {
    author: "authors", authors: "authors",
    format: "formats", formats: "formats",
    language: "languages", languages: "languages",
    reward: "rating", rewards: "rating", rating: "rating", ratings: "rating",
    series: "series",
  }
  const normalizeCategoryKey = (key: string) => {
    const lower = key.trim().toLowerCase()
    return CATEGORY_ALIASES[lower] ?? lower
  }
  const buildItemKey = (categoryKey: string, value: string) =>
    `${normalizeCategoryKey(categoryKey)}:${value.trim().toLowerCase()}`
  const buildTagQuery = (categoryKey: string, value: string, calibreOp = "=") =>
    `${normalizeCategoryKey(categoryKey)}:${calibreOp}${value.trim()}`
  const stripWrappingQuotes = (v: string) => {
    const t = v.trim()
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
      return t.slice(1, -1).trim()
    return t
  }
  const normalizeQueryValue = (v: string) => {
    let s = v.trim()
    s = stripWrappingQuotes(s)
    s = s.replace(/^(!?[=~])/, "").trim()
    s = stripWrappingQuotes(s)
    return s.toLowerCase()
  }
  const parseTagQuery = (query: string) => {
    const q = query.trim()
    const sep = q.indexOf(":")
    if (sep <= 0) return null
    const rawCategory = q.slice(0, sep).trim()
    let rawValue = q.slice(sep + 1).trim()
    const m = rawValue.match(/\s+(and|or)\s+/i)
    if (m && m.index != null) rawValue = rawValue.slice(0, m.index).trim()
    rawValue = rawValue.replace(/^(!?[=~])/, "").trim()
    if (!rawCategory || !rawValue) return null
    return { categoryKey: rawCategory, value: rawValue }
  }
  const normalizeTagQuery = (query: string | undefined) => {
    if (!query) return null
    const p = parseTagQuery(query)
    if (!p) return null
    const cat = normalizeCategoryKey(p.categoryKey)
    const val = normalizeQueryValue(p.value)
    if (!cat || !val) return null
    return `${cat}:=${val}`
  }
  return {
    LeftSideMenu: () => null,
    normalizeCategoryKey,
    buildItemKey,
    buildTagQuery,
    normalizeTagQuery,
    parseTagQuery,
  }
})

const mockTagBrowser = [
  {
    name: "authors",
    items: [{ name: "Stephen King", count: 5, children: [] }],
  },
]

const mockSelectedLibrary = {
  tagBrowser: mockTagBrowser,
}

let useDetailSearch: typeof import("./useDetailSearch").useDetailSearch

beforeAll(async () => {
  ;({ useDetailSearch } = await import("./useDetailSearch"))
})

beforeEach(() => {
  useStoresMock.mockReturnValue({
    calibreRootStore: {
      selectedLibrary: mockSelectedLibrary,
    },
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe("useDetailSearch", () => {
  test("initializes pendingQuery from initialQuery argument", () => {
    const { result } = renderHook(() => useDetailSearch("authors:=Stephen King"))
    expect(result.current.pendingQuery).toBe("authors:=Stephen King")
  })

  test("initializes with empty selectedNames when initialQuery is empty", () => {
    const { result } = renderHook(() => useDetailSearch(""))
    expect(result.current.selectedNames).toEqual([])
  })

  test("parses selectedNames from initialQuery", () => {
    const { result } = renderHook(() => useDetailSearch("authors:=Stephen King"))
    expect(result.current.selectedNames).toContain("authors:=Stephen King")
  })

  test("onNodePress adds a new query item to pendingQuery", async () => {
    const { result } = renderHook(() => useDetailSearch(""))
    await act(async () => {
      await result.current.onNodePress("authors:=Stephen King")
    })
    expect(result.current.pendingQuery).toBe("authors:=Stephen King")
  })

  test("onNodePress toggles off an already selected item", async () => {
    const { result } = renderHook(() => useDetailSearch("authors:=Stephen King"))
    await act(async () => {
      await result.current.onNodePress("authors:=Stephen King")
    })
    expect(result.current.pendingQuery).toBe("")
    expect(result.current.selectedNames).toEqual([])
  })

  test("onNodePress appends a second item joined with AND by default", async () => {
    const { result } = renderHook(() => useDetailSearch("authors:=Stephen King"))
    await act(async () => {
      await result.current.onNodePress("tags:=Horror")
    })
    expect(result.current.pendingQuery).toBe("authors:=Stephen King AND tags:=Horror")
  })

  test("onItemOperatorChange rebuilds query with updated operator", async () => {
    const { result } = renderHook(() =>
      useDetailSearch("authors:=Stephen King AND tags:=Horror"),
    )
    act(() => {
      result.current.onItemOperatorChange("authors:stephen king", "OR")
    })
    expect(result.current.pendingQuery).toBe("authors:=Stephen King OR tags:=Horror")
  })

  test("onItemCalibreOperatorChange updates calibre operator in query", async () => {
    const { result } = renderHook(() => useDetailSearch("authors:=Stephen King"))
    act(() => {
      result.current.onItemCalibreOperatorChange("authors", "Stephen King", "~")
    })
    expect(result.current.pendingQuery).toBe("authors:~Stephen King")
  })

  test("exposes tagBrowser from selectedLibrary store", () => {
    const { result } = renderHook(() => useDetailSearch(""))
    expect(result.current.tagBrowser).toBe(mockTagBrowser)
  })
})
