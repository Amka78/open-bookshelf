import { useLibrary } from "./useLibrary"
import { useStores } from "@/models"
import { useConvergence } from "@/hooks/useConvergence"
import { useNavigation } from "@react-navigation/native"
import { api } from "@/services/api"

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

    const { completeSearchParameter } = useLibrary()
    const completed = completeSearchParameter("test text")

    expect(completed).toBe("test text")
  })

  test("completeSearchParameter completes search parameter", () => {
    const { completeSearchParameter } = useLibrary()
    const completed = completeSearchParameter("aut:")

    expect(completed).toBe("authors:=")
  })

  test("completeSearchParameter returns text unchanged if no match", () => {
    const { completeSearchParameter } = useLibrary()
    const completed = completeSearchParameter("xyz:")

    expect(completed).toBe("xyz:")
  })

  test("completeSearchParameter handles multiple matches", () => {
    const { completeSearchParameter } = useLibrary()
    const completed = completeSearchParameter("t:")

    expect(completed).toBe("t:")
  })

  test("completeSearchParameter works with prefix text", () => {
    const { completeSearchParameter } = useLibrary()
    const completed = completeSearchParameter("query aut:")

    expect(completed).toBe("query authors:=")
  })

  test("searchParameterCandidates returns unique search terms", () => {
    const { searchParameterCandidates } = useLibrary()

    expect(searchParameterCandidates).toContain("authors")
    expect(searchParameterCandidates).toContain("author1")
    expect(searchParameterCandidates).toContain("author2")
    expect(searchParameterCandidates).toContain("tags")
    expect(searchParameterCandidates).toContain("tag1")
    expect(searchParameterCandidates).toContain("tag2")
  })

  test("searchParameterCandidates returns empty array if no library", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        ...mockCallibreRootStore,
        selectedLibrary: null,
      },
    })

    const { searchParameterCandidates } = useLibrary()

    expect(searchParameterCandidates).toEqual([])
  })

  test("onSearch calls searchLibrary", async () => {
    const { onSearch } = useLibrary()

    await onSearch("test query")

    expect(mockSetProp).toHaveBeenCalledWith("query", "test query")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort updates sort and sortOrder", async () => {
    const { onSort } = useLibrary()

    await onSort("authors")

    expect(mockSetProp).toHaveBeenCalledWith("sort", "authors")
    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
    expect(mockSearchLibrary).toHaveBeenCalled()
  })

  test("onSort toggles sortOrder when same sort key is selected", async () => {
    const { onSort } = useLibrary()

    await onSort("title")

    expect(mockSetProp).toHaveBeenCalledWith("sortOrder", "desc")
  })

  test("onChangeListStyle changes list style", () => {
    const { onChangeListStyle, currentListStyle: initialStyle } = useLibrary()

    expect(initialStyle).toBe("viewList")

    onChangeListStyle()

    const { currentListStyle: afterChangeStyle } = useLibrary()
    expect(afterChangeStyle).toBe("gridView")
  })

  test("onUploadFile uploads file and searches", async () => {
    const mockUploadFile = jest.fn().mockResolvedValue(undefined)
    ;(api.uploadFile as jest.Mock) = mockUploadFile

    const { onUploadFile, onSearch } = useLibrary()

    const mockAssets = [
      {
        name: "test.epub",
        uri: "file:///path/to/test.epub",
        file: new File([], "test.epub"),
      },
    ]

    await onUploadFile(mockAssets)

    expect(mockUploadFile).toHaveBeenCalledWith(
      "test.epub",
      "test-library",
      mockAssets[0].file,
    )
  })

  test("current list style is viewList on mobile by default", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
    })

    const { currentListStyle } = useLibrary()

    expect(currentListStyle).toBe("viewList")
  })

  test("current list style is gridView on desktop by default", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: true,
    })

    const { currentListStyle } = useLibrary()

    expect(currentListStyle).toBe("gridView")
  })
})
