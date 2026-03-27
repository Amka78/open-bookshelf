import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { useStores } from "@/models"
import { renderHook } from "@testing-library/react"
import { useModal } from "react-native-modalfy"

mock.module("../../hooks/useConvergence", () => ({
  useConvergence: jest.fn(),
}))

let useConvergence: typeof import("../../hooks/useConvergence").useConvergence
let useViewer: typeof import("./useViewer").useViewer

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

  beforeAll(() => {
    jest.useRealTimers()
  })

  beforeAll(async () => {
    ;({ useConvergence } = await import("../../hooks/useConvergence"))
    ;({ useViewer } = await import("./useViewer"))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test("initializes with default values", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.showMenu).toBe(false)
    expect(result.current.initialPage).toBe(0)
    expect(result.current.orientation).toBe("vertical")
    expect(result.current.selectedBook).toBe(mockSelectedBook)
    expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
  })

  test("returns correct reading style for vertical orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.readingStyle).toBe("singlePage")
  })

  test("returns correct reading style for horizontal orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "horizontal",
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.readingStyle).toBe("facingPageWithTitle")
  })

  test("returns correct page direction for vertical orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.pageDirection).toBe("left")
  })

  test("returns correct page direction for horizontal orientation", () => {
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "horizontal",
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.pageDirection).toBe("left")
  })

  test("onManageMenu function exists", () => {
    const { result } = renderHook(() => useViewer())

    expect(typeof result.current.onManageMenu).toBe("function")
  })

  test("onSetBookReadingStyle calls setProp with correct style", () => {
    const { result } = renderHook(() => useViewer())

    result.current.onSetBookReadingStyle("facingPage")

    expect(mockSetProp).toHaveBeenCalled()
  })

  test("onSetPageDirection calls setProp with correct direction", () => {
    const { result } = renderHook(() => useViewer())

    result.current.onSetPageDirection("right")

    expect(mockSetProp).toHaveBeenCalled()
  })

  test("onPageChange updates current page in history", async () => {
    const { result } = renderHook(() => useViewer())

    await result.current.onPageChange(3)

    expect(mockSetCurrentPage).toHaveBeenCalledWith(3)
  })

  test("onPageChange does not update if page is same as current", async () => {
    const { result } = renderHook(() => useViewer())

    mockSetCurrentPage.mockClear()

    await result.current.onPageChange(2)

    expect(mockSetCurrentPage).not.toHaveBeenCalled()
  })

  test("cachedPathList returns history cached path", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.cachedPathList).toEqual(["cached1.png", "cached2.png", "cached3.png"])
  })

  test("totalPage is not returned even when cache exists", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.totalPage).toBeUndefined()
  })

  test("totalPage is not returned when no cache", () => {
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

    const { result } = renderHook(() => useViewer())

    expect(result.current.totalPage).toBeUndefined()
  })

  test("cachedPathList is undefined when cache is empty", () => {
    const mockHistoryEmptyCached = {
      ...mockHistory,
      cachedPath: [],
    }
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [mockHistoryEmptyCached],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.cachedPathList).toBeUndefined()
    expect(result.current.totalPage).toBeUndefined()
  })

  test("onLastPage opens rating modal", () => {
    const { result } = renderHook(() => useViewer())

    result.current.onLastPage()

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ViewerRatingModal",
      expect.objectContaining({
        initialRating: 0,
      }),
    )
  })

  test("onLastPage does not open modal twice with same prompt key", () => {
    const { result } = renderHook(() => useViewer())

    result.current.onLastPage()
    mockOpenModal.mockClear()

    result.current.onLastPage()

    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  test("returns properties when book and library exist", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.selectedBook).not.toBeNull()
    expect(result.current.selectedLibrary).not.toBeNull()
    expect(result.current.orientation).toBeDefined()
    expect(result.current.onPageChange).toBeDefined()
    expect(result.current.onLastPage).toBeDefined()
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

    const { result } = renderHook(() => useViewer())

    expect(result.current.readingStyle).toBe("singlePage")
  })

  test("handles when selected library is null", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: null,
        readingHistories: [],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.selectedLibrary).toBeNull()
  })

  test("history format matches when selected format is defined", () => {
    const { result } = renderHook(() => useViewer())

    // When selectedFormat matches, history should be found
    expect(result.current.selectedBook?.metaData.selectedFormat).toBe("pdf")
    expect(result.current.cachedPathList).toEqual(["cached1.png", "cached2.png", "cached3.png"])
  })

  test("matches history case-insensitively by selected format", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            metaData: {
              ...mockSelectedBook.metaData,
              selectedFormat: "PDF",
            },
          },
        },
        readingHistories: [mockHistory],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.cachedPathList).toEqual(["cached1.png", "cached2.png", "cached3.png"])
  })

  test("does not fall back to a different format history", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            metaData: {
              ...mockSelectedBook.metaData,
              selectedFormat: "AZW3",
            },
          },
        },
        readingHistories: [mockHistory],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.cachedPathList).toBeUndefined()
    expect(result.current.totalPage).toBeUndefined()
    expect(result.current.initialPage).toBe(0)
  })

  test("returns initial page 0 when no history exists", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.initialPage).toBe(0)
  })
})
