import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { useNavigation } from "@react-navigation/native"
import { act, renderHook } from "@testing-library/react"
import { useLibrary } from "./useLibrary"

jest.mock("@/models")
jest.mock("@/hooks/useConvergence")
jest.mock("@react-navigation/native")
jest.mock("@/services/api")
jest.mock("@/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
  },
}))

// Mock for React hooks
const mockSetSearching = jest.fn()
const mockSetMobileViewStyle = jest.fn()
const mockSetDesktopViewStyle = jest.fn()
const mockSetHeaderSearchText = jest.fn()

describe("useLibrary", () => {
  const mockSearchLibrary = jest.fn().mockResolvedValue(undefined)
  const mockGetTagBrowser = jest.fn().mockResolvedValue(undefined)
  const mockSetProp = jest.fn()

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
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCallibreRootStore,
    })
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
    })
    ;(useNavigation as jest.Mock).mockReturnValue({})
  })

  test("completeSearchParameter returns text unchanged if not ending with colon", () => {
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
    })

    const { result } = renderHook(() => useLibrary())
    const completed = result.current.completeSearchParameter("test text")

    expect(completed).toBe("test text")
  })

  test("completeSearchParameter completes search parameter", () => {
    const { result } = renderHook(() => useLibrary())
    const completed = result.current.completeSearchParameter("aut:")

    expect(completed).toBe("aut:")
  })

  test("completeSearchParameter returns text unchanged if no match", () => {
    const { result } = renderHook(() => useLibrary())
    const completed = result.current.completeSearchParameter("xyz:")

    expect(completed).toBe("xyz:")
  })

  test("completeSearchParameter handles multiple matches", () => {
    const { result } = renderHook(() => useLibrary())
    const completed = result.current.completeSearchParameter("t:")

    expect(completed).toBe("t:")
  })

  test("completeSearchParameter works with prefix text", () => {
    const { result } = renderHook(() => useLibrary())
    const completed = result.current.completeSearchParameter("query aut:")

    expect(completed).toBe("query aut:")
  })

  test("searchParameterCandidates returns unique search terms", () => {
    const { result } = renderHook(() => useLibrary())

    expect(result.current.searchParameterCandidates).toContain("author1")
    expect(result.current.searchParameterCandidates).toContain("author2")
    expect(result.current.searchParameterCandidates).toContain("tag1")
    expect(result.current.searchParameterCandidates).toContain("tag2")
  })

  test("searchParameterCandidates returns empty array if no library", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        ...mockCallibreRootStore,
        selectedLibrary: null,
      },
    })

    const { result } = renderHook(() => useLibrary())

    expect(result.current.searchParameterCandidates).toEqual([])
  })

  test("onSearch calls searchLibrary", async () => {
    const { result } = renderHook(() => useLibrary())

    await act(async () => {
      await result.current.onSearch("test query")
    })

    expect(mockSetProp).toHaveBeenCalledWith("query", "test query")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort updates sort and sortOrder", async () => {
    const { result } = renderHook(() => useLibrary())

    await act(async () => {
      await result.current.onSort("authors")
    })

    expect(mockSetProp).toHaveBeenCalledWith("sort", "authors")
    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort toggles sortOrder when same sort key is selected", async () => {
    const { result } = renderHook(() => useLibrary())

    await act(async () => {
      await result.current.onSort("title")
    })

    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
  })

  test("onChangeListStyle changes list style", () => {
    const { result } = renderHook(() => useLibrary())
    expect(result.current.currentListStyle).toBe("viewList")

    act(() => {
      result.current.onChangeListStyle()
    })

    expect(result.current.currentListStyle).toBe("gridView")
  })

  test("onUploadFile uploads file and searches", async () => {
    const mockUploadFile = jest.fn().mockResolvedValue(undefined)
    ;(api.uploadFile as jest.Mock) = mockUploadFile

    const { result } = renderHook(() => useLibrary())

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

  test("current list style is viewList on mobile by default", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
    })

    const { result } = renderHook(() => useLibrary())

    expect(result.current.currentListStyle).toBe("viewList")
  })

  test("current list style is gridView on desktop by default", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: true,
    })

    const { result } = renderHook(() => useLibrary())

    expect(result.current.currentListStyle).toBe("gridView")
  })
})
