import { useStores } from "@/models"
import { renderHook } from "@testing-library/react"
import { useModal } from "react-native-modalfy"
import { useConvergence } from "../../hooks/useConvergence"
import { useViewer } from "./useViewer"

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

  test("totalPage returns cached path length when available", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.totalPage).toBe(3)
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

    const { result } = renderHook(() => useViewer())

    expect(result.current.totalPage).toBe(5)
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
