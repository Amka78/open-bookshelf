import {
  afterAll,
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { useNavigation } from "@react-navigation/native"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseConvergence = jest.fn()

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: mockUseConvergence,
}))

const mockUseNavigation = jest.fn()

mock.module("@react-navigation/native", () => ({
  useNavigation: mockUseNavigation,
}))

let useLibrary: typeof import("./useLibrary").useLibrary

describe("useLibrary", () => {
  const mockSearchLibrary = jest.fn().mockResolvedValue(undefined)
  const mockGetTagBrowser = jest.fn().mockResolvedValue(undefined)
  const mockSetProp = jest.fn()

  const mockSelectedLibrary = {
    id: "test-library",
    books: new Map([
      ["1", { id: 1, metaData: { title: "Book 1" } }],
      ["2", { id: 2, metaData: { title: "Book 2" } }],
      ["3", { id: 3, metaData: { title: "Book 3" } }],
    ]),
    searchSetting: {
      query: "",
      sort: "title",
      sortOrder: "asc" as const,
      setProp: mockSetProp,
    },
    sortField: [],
    fieldMetadataList: new Map([
      [
        "authors",
        {
          searchTerms: ["author1", "author2"],
        },
      ],
      [
        "tags",
        {
          searchTerms: ["tag1", "tag2"],
        },
      ],
    ]),
    tagBrowser: [],
    setBook: jest.fn(),
  }

  const mockCallibreRootStore = {
    selectedLibrary: mockSelectedLibrary,
    searchLibrary: mockSearchLibrary,
    getTagBrowser: mockGetTagBrowser,
    readingHistories: [],
  }

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCallibreRootStore,
      settingStore: {
        booksPerPage: 20,
        addRecentSearch: jest.fn(),
      },
    })
    mockUseConvergence.mockReturnValue({
      isLarge: false,
    })
    ;(useNavigation as jest.Mock).mockReturnValue({})
  })

  beforeAll(async () => {
    ;({ useLibrary } = await import("./useLibrary"))
    jest.useRealTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const renderUseLibrary = async () => {
    const hook = renderHook(() => useLibrary())
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    return hook
  }

  test("completeSearchParameter returns text unchanged if not ending with colon", async () => {
    const mockSelectedLibrary = {
      id: "test-library",
      books: {},
      searchSetting: {
        query: "",
        sort: "title",
        sortOrder: "asc" as const,
        setProp: mockSetProp,
      },
      sortField: [],
      fieldMetadataList: new Map(),
      tagBrowser: [],
      setBook: jest.fn(),
    }
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        ...mockCallibreRootStore,
        selectedLibrary: mockSelectedLibrary,
      },
      settingStore: {
        booksPerPage: 20,
        addRecentSearch: jest.fn(),
      },
    })

    const { result } = await renderUseLibrary()
    const completed = result.current.completeSearchParameter("test text")

    expect(completed).toBe("test text")
  })

  test("completeSearchParameter completes search parameter", async () => {
    const { result } = await renderUseLibrary()
    const completed = result.current.completeSearchParameter("aut:")

    expect(completed).toBe("aut:")
  })

  test("completeSearchParameter returns text unchanged if no match", async () => {
    const { result } = await renderUseLibrary()
    const completed = result.current.completeSearchParameter("xyz:")

    expect(completed).toBe("xyz:")
  })

  test("completeSearchParameter handles multiple matches", async () => {
    const { result } = await renderUseLibrary()
    const completed = result.current.completeSearchParameter("t:")

    expect(completed).toBe("t:")
  })

  test("completeSearchParameter works with prefix text", async () => {
    const { result } = await renderUseLibrary()
    const completed = result.current.completeSearchParameter("query aut:")

    expect(completed).toBe("query aut:")
  })

  test("searchParameterCandidates returns unique search terms", async () => {
    const { result } = await renderUseLibrary()

    expect(result.current.searchParameterCandidates).toContain("author1")
    expect(result.current.searchParameterCandidates).toContain("author2")
    expect(result.current.searchParameterCandidates).toContain("tag1")
    expect(result.current.searchParameterCandidates).toContain("tag2")
  })

  test("searchParameterCandidates returns empty array if no library", async () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        ...mockCallibreRootStore,
        selectedLibrary: null,
      },
      settingStore: {
        booksPerPage: 20,
        addRecentSearch: jest.fn(),
      },
    })

    const { result } = await renderUseLibrary()

    expect(result.current.searchParameterCandidates).toEqual([])
  })

  test("onSearch calls searchLibrary", async () => {
    const { result } = await renderUseLibrary()

    await act(async () => {
      await result.current.onSearch("test query")
    })

    expect(mockSetProp).toHaveBeenCalledWith("query", "test query")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort updates sort and sortOrder", async () => {
    const { result } = await renderUseLibrary()

    await act(async () => {
      await result.current.onSort("authors")
    })

    expect(mockSetProp).toHaveBeenCalledWith("sort", "authors")
    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort toggles sortOrder when same sort key is selected", async () => {
    const { result } = await renderUseLibrary()

    await act(async () => {
      await result.current.onSort("title")
    })

    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
  })

  test("onChangeListStyle changes list style", async () => {
    const { result } = await renderUseLibrary()
    expect(result.current.currentListStyle).toBe("viewList")

    act(() => {
      result.current.onChangeListStyle()
    })

    expect(result.current.currentListStyle).toBe("gridView")
  })

  test("onUploadFile uploads file and searches", async () => {
    const mockUploadFile = jest.spyOn(api, "uploadFile").mockResolvedValue(undefined)

    const { result } = await renderUseLibrary()

    const mockAssets = [
      {
        name: "test.epub",
        uri: "file:///path/to/test.epub",
        file: new File([], "test.epub"),
        lastModified: Date.now(),
      },
    ] as Array<{ name: string; uri: string; file: File; lastModified: number }>

    await act(async () => {
      await result.current.onUploadFile(mockAssets)
    })

    expect(mockUploadFile).toHaveBeenCalledWith("test.epub", "test-library", mockAssets[0].file)
  })

  test("current list style is viewList on mobile by default", async () => {
    mockUseConvergence.mockReturnValue({
      isLarge: false,
    })

    const { result } = await renderUseLibrary()

    expect(result.current.currentListStyle).toBe("viewList")
  })

  test("current list style is gridView on desktop by default", async () => {
    mockUseConvergence.mockReturnValue({
      isLarge: true,
    })

    const { result } = await renderUseLibrary()

    expect(result.current.currentListStyle).toBe("gridView")
  })

  test("pressing a book selects only that book in single selection mode", async () => {
    const { result } = await renderUseLibrary()

    act(() => {
      result.current.handleBookPress(1)
    })

    expect(result.current.selectionMode).toBe("single")
    expect(result.current.isSelectionMode).toBe(false)
    expect(result.current.isBookSelected(1)).toBe(true)
    expect(result.current.selectedBookIds.size).toBe(1)

    act(() => {
      result.current.handleBookPress(2)
    })

    expect(result.current.selectionMode).toBe("single")
    expect(result.current.isBookSelected(1)).toBe(false)
    expect(result.current.isBookSelected(2)).toBe(true)
    expect(result.current.selectedBookIds.size).toBe(1)
  })

  test("pressing the same book again in single selection mode deselects it", async () => {
    const { result } = await renderUseLibrary()

    act(() => {
      result.current.handleBookPress(1)
    })

    expect(result.current.selectionMode).toBe("single")
    expect(result.current.isBookSelected(1)).toBe(true)
    expect(result.current.selectedBookIds.size).toBe(1)

    act(() => {
      result.current.handleBookPress(1)
    })

    expect(result.current.selectionMode).toBe("none")
    expect(result.current.isBookSelected(1)).toBe(false)
    expect(result.current.selectedBookIds.size).toBe(0)
  })

  test("entering multi selection keeps previous selections when another book is pressed", async () => {
    const { result } = await renderUseLibrary()

    act(() => {
      result.current.enterMultiSelection(1)
    })

    expect(result.current.selectionMode).toBe("multi")
    expect(result.current.isSelectionMode).toBe(true)
    expect(result.current.isBookSelected(1)).toBe(true)

    act(() => {
      result.current.handleBookPress(2)
    })

    expect(result.current.selectionMode).toBe("multi")
    expect(result.current.isBookSelected(1)).toBe(true)
    expect(result.current.isBookSelected(2)).toBe(true)
    expect(result.current.selectedBookIds.size).toBe(2)
  })

  test("toggleBooksSelection selects all visible books when some are not yet selected", async () => {
    const { result } = await renderUseLibrary()

    act(() => {
      result.current.toggleBookSelection(1)
      result.current.toggleBooksSelection([1, 2])
    })

    expect(result.current.isBookSelected(1)).toBe(true)
    expect(result.current.isBookSelected(2)).toBe(true)
    expect(result.current.areAllBooksSelected([1, 2])).toBe(true)
  })

  test("toggleBooksSelection clears only the visible selection when all visible books are selected", async () => {
    const { result } = await renderUseLibrary()

    act(() => {
      result.current.toggleBooksSelection([1, 2, 3])
      result.current.toggleBooksSelection([1, 2])
    })

    expect(result.current.isBookSelected(1)).toBe(false)
    expect(result.current.isBookSelected(2)).toBe(false)
    expect(result.current.isBookSelected(3)).toBe(true)
    expect(result.current.areAllBooksSelected([1, 2])).toBe(false)
  })

  test("areAllBooksSelected returns false when the list is empty", async () => {
    const { result } = await renderUseLibrary()

    expect(result.current.areAllBooksSelected([])).toBe(false)
  })
})
