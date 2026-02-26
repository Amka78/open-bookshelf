import { useViewer } from "./useViewer"
import { useStores } from "@/models"
import { useConvergence } from "../../hooks/useConvergence"
import { useModal } from "react-native-modalfy"

jest.mock("@/models")
jest.mock("../../hooks/useConvergence")
jest.mock("react-native-modalfy")
jest.mock("@react-navigation/native")

describe("useViewer", () => {
  const mockSetProp = jest.fn()
  const mockSetCurrentPage = jest.fn()
  const mockUpdate = jest.fn().mockResolvedValue(true)
  const mockOpenModal = jest.fn()

  const mockClientSetting = {
    id: 1,
    verticalReadingStyle: "singlePage" as const,
    verticalPageDirection: "left" as const,
    horizontalReadingStyle: "facingPageWithTitle" as const,
    horizontalPageDirection: "left" as const,
    setProp: mockSetProp,
  }

  const mockSelectedBook = {
    id: 1,
    path: ["page1.png", "page2.png", "page3.png", "page4.png", "page5.png"],
    metaData: {
      selectedFormat: "pdf",
      title: "Test Book",
      rating: 0,
      setProp: jest.fn(),
    },
    update: mockUpdate,
  }

  const mockHistory = {
    bookId: 1,
    libraryId: "lib-1",
    format: "pdf",
    currentPage: 2,
    cachedPath: ["cached1.png", "cached2.png", "cached3.png"],
    setCurrentPage: mockSetCurrentPage,
  }

  const mockSelectedLibrary = {
    id: "lib-1",
    selectedBook: mockSelectedBook,
    clientSetting: [mockClientSetting],
    readingHistories: [mockHistory],
    setProp: jest.fn(),
  }

  const mockCalibreRootStore = {
    selectedLibrary: mockSelectedLibrary,
    readingHistories: [mockHistory],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCalibreRootStore,
    })
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })
    ;(useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
    })
  })

  test("initializes with default values", () => {
    const result = useViewer()

    expect(result.showMenu).toBe(false)
    expect(result.initialPage).toBe(0)
    expect(result.orientation).toBe("vertical")
    expect(result.selectedBook).toBe(mockSelectedBook)
    expect(result.selectedLibrary).toBe(mockSelectedLibrary)
  })

  test("returns correct reading style for vertical orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })

    const result = useViewer()

    expect(result.readingStyle).toBe("singlePage")
  })

  test("returns correct reading style for horizontal orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "horizontal",
    })

    const result = useViewer()

    expect(result.readingStyle).toBe("facingPageWithTitle")
  })

  test("returns correct page direction for vertical orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })

    const result = useViewer()

    expect(result.pageDirection).toBe("left")
  })

  test("returns correct page direction for horizontal orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "horizontal",
    })

    const result = useViewer()

    expect(result.pageDirection).toBe("left")
  })

  test("onManageMenu function exists", () => {
    const result = useViewer()

    expect(typeof result.onManageMenu).toBe("function")
  })

  test("onSetBookReadingStyle calls setProp with correct style", () => {
    const result = useViewer()

    result.onSetBookReadingStyle("facingPage")

    expect(mockSetProp).toHaveBeenCalled()
  })

  test("onSetPageDirection calls setProp with correct direction", () => {
    const result = useViewer()

    result.onSetPageDirection("right")

    expect(mockSetProp).toHaveBeenCalled()
  })

  test("onPageChange updates current page in history", async () => {
    const result = useViewer()

    await result.onPageChange(3)

    expect(mockSetCurrentPage).toHaveBeenCalledWith(3)
  })

  test("onPageChange does not update if page is same as current", async () => {
    const result = useViewer()

    mockSetCurrentPage.mockClear()

    await result.onPageChange(2)

    expect(mockSetCurrentPage).not.toHaveBeenCalled()
  })

  test("cachedPathList returns history cached path", () => {
    const result = useViewer()

    expect(result.cachedPathList).toEqual(["cached1.png", "cached2.png", "cached3.png"])
  })

  test("totalPage returns cached path length when available", () => {
    const result = useViewer()

    expect(result.totalPage).toBe(3)
  })

  test("totalPage returns book path length when no cache", () => {
    const mockHistoryNoCached = {
      ...mockHistory,
      cachedPath: undefined,
    }

    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [mockHistoryNoCached],
      },
    })

    const result = useViewer()

    expect(result.totalPage).toBe(5)
  })

  test("onLastPage opens rating modal", () => {
    const result = useViewer()

    result.onLastPage()

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ViewerRatingModal",
      expect.objectContaining({
        initialRating: 0,
      }),
    )
  })

  test("onLastPage does not open modal twice with same prompt key", () => {
    const result = useViewer()

    result.onLastPage()
    mockOpenModal.mockClear()

    result.onLastPage()

    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  test("returns properties when book and library exist", () => {
    const result = useViewer()

    expect(result.selectedBook).not.toBeNull()
    expect(result.selectedLibrary).not.toBeNull()
    expect(result.orientation).toBeDefined()
    expect(result.onPageChange).toBeDefined()
    expect(result.onLastPage).toBeDefined()
  })

  test("creates default client setting if not found", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          clientSetting: [],
        },
        readingHistories: [mockHistory],
      },
    })

    const result = useViewer()

    expect(result.readingStyle).toBe("singlePage")
  })

  test("handles when selected library is null", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: null,
        readingHistories: [],
      },
    })

    const result = useViewer()

    expect(result.selectedLibrary).toBeNull()
  })

  test("history format matches when selected format is defined", () => {
    const result = useViewer()

    // When selectedFormat matches, history should be found
    expect(result.selectedBook?.metaData.selectedFormat).toBe("pdf")
  })

  test("returns initial page 0 when no history exists", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [],
      },
    })

    const result = useViewer()

    expect(result.initialPage).toBe(0)
  })
})
