import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { useStores } from "@/models"
import { act, renderHook } from "@testing-library/react"
import { useModal } from "react-native-modalfy"
import {
  createFrameScheduler,
  playResumeReadingPromptAccepts,
  playResumeReadingPromptAppears,
  playResumeReadingPromptDeclines,
  playResumeReadingPromptDoesNotReopenOnRerender,
} from "./useViewerPlay"

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
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame

  const getLastModalArgs = <T>(modalName: string) => {
    const matchedCall = [...mockOpenModal.mock.calls]
      .reverse()
      .find(([calledModalName]) => calledModalName === modalName)

    return matchedCall?.[1] as T | undefined
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
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  })

  test("returns hidden menu and first-page defaults on initial render", () => {
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

  test("returns viewer handlers and selected entities when book and library are available", () => {
    const { result } = renderHook(() => useViewer())

    expect(result.current.selectedBook).not.toBeNull()
    expect(result.current.selectedLibrary).not.toBeNull()
    expect(result.current.orientation).toBeDefined()
    expect(result.current.onPageChange).toBeDefined()
    expect(result.current.onLastPage).toBeDefined()
  })

  test("opens the resume reading confirm modal when the current format has saved progress", async () => {
    const frames = createFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    renderHook(() => useViewer())

    await playResumeReadingPromptAppears({
      flushFrame: frames.flushFrame,
    })

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "modal.resumeReadingConfirmModal.title",
        messageTx: "modal.resumeReadingConfirmModal.message",
      }),
    )
  })

  test("keeps the resume reading confirm modal to a single open call across rerenders", async () => {
    const frames = createFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    const { rerender } = renderHook(() => useViewer())

    await playResumeReadingPromptDoesNotReopenOnRerender({
      rerender,
      flushFrame: frames.flushFrame,
    })

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    expect(mockOpenModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "modal.resumeReadingConfirmModal.title",
      }),
    )
  })

  test("restores the selected format from reading history when the book format is unset", async () => {
    const setSelectedFormat = jest.fn()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            metaData: {
              ...mockSelectedBook.metaData,
              selectedFormat: undefined,
              setProp: setSelectedFormat,
            },
          },
        },
        readingHistories: [mockHistory],
      },
    })

    renderHook(() => useViewer())

    await act(async () => {})

    expect(setSelectedFormat).toHaveBeenCalledWith("selectedFormat", "pdf")
  })

  test("starts the viewer immediately without a resume prompt when saved progress is at the first page", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [
          {
            ...mockHistory,
            currentPage: 0,
          },
        ],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.viewerReady).toBe(true)
    expect(result.current.initialPage).toBe(0)
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  test("accepting the resume reading confirm modal resumes from the saved page", async () => {
    const frames = createFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    const { result } = renderHook(() => useViewer())

    await playResumeReadingPromptAccepts({
      flushFrame: frames.flushFrame,
      onAccept: () => getLastModalArgs<{ onOKPress: () => void }>("ConfirmModal")?.onOKPress(),
    })

    expect(result.current.viewerReady).toBe(true)
    expect(result.current.initialPage).toBe(2)
  })

  test("accepting the resume reading confirm modal clamps the restored page to the last available page", async () => {
    const frames = createFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            path: ["page1.png", "page2.png", "page3.png"],
          },
        },
        readingHistories: [
          {
            ...mockHistory,
            currentPage: 99,
          },
        ],
      },
    })

    const { result } = renderHook(() => useViewer())

    await playResumeReadingPromptAccepts({
      flushFrame: frames.flushFrame,
      onAccept: () => getLastModalArgs<{ onOKPress: () => void }>("ConfirmModal")?.onOKPress(),
    })

    expect(result.current.initialPage).toBe(2)
    expect(result.current.viewerReady).toBe(true)
  })

  test("declining the resume reading confirm modal starts from the first page", async () => {
    const frames = createFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    const { result } = renderHook(() => useViewer())

    await playResumeReadingPromptDeclines({
      flushFrame: frames.flushFrame,
      onDecline: () =>
        getLastModalArgs<{ onCancelPress: () => void }>("ConfirmModal")?.onCancelPress(),
    })

    expect(result.current.viewerReady).toBe(true)
    expect(result.current.initialPage).toBe(0)
  })

  test("submitting a rating from the last-page modal updates the selected book", async () => {
    const { result } = renderHook(() => useViewer())

    result.current.onLastPage()

    const ratingModalArgs = getLastModalArgs<{ onSubmit: (rating: number) => Promise<void> }>(
      "ViewerRatingModal",
    )
    expect(ratingModalArgs?.onSubmit).toBeDefined()

    await act(async () => {
      await ratingModalArgs?.onSubmit(4)
    })

    expect(mockUpdate).toHaveBeenCalledWith("lib-1", { rating: 4 }, ["rating"])
  })

  test("opens an error modal when saving a last-page rating fails", async () => {
    mockUpdate.mockResolvedValueOnce(false)

    const { result } = renderHook(() => useViewer())

    result.current.onLastPage()

    const ratingModalArgs = getLastModalArgs<{ onSubmit: (rating: number) => Promise<void> }>(
      "ViewerRatingModal",
    )

    await act(async () => {
      await ratingModalArgs?.onSubmit(1)
    })

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        titleTx: "common.error",
        message: "Failed to update rating.",
      }),
    )
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
