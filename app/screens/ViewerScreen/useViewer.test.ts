import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"

function createFrameScheduler() {
  let nextId = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  return {
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = nextId++
      callbacks.set(id, callback)
      return id
    },
    cancelAnimationFrame: (id: number) => {
      callbacks.delete(id)
    },
    flushFrame: () => {
      const entry = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined
      if (!entry) return false
      const [id, callback] = entry
      callbacks.delete(id)
      callback(0)
      return true
    },
  }
}

async function playResumeReadingPromptAppears({ flushFrame }: { flushFrame: () => boolean }) {
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

async function playResumeReadingPromptDoesNotReopenOnRerender({
  rerender,
  flushFrame,
}: { rerender: () => void; flushFrame: () => boolean }) {
  await playResumeReadingPromptAppears({ flushFrame })
  await act(async () => {
    rerender()
  })
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

async function playResumeReadingPromptAccepts({
  flushFrame,
  onAccept,
}: { flushFrame: () => boolean; onAccept: () => void }) {
  await playResumeReadingPromptAppears({ flushFrame })
  await act(async () => {
    onAccept()
  })
}

async function playResumeReadingPromptDeclines({
  flushFrame,
  onDecline,
}: { flushFrame: () => boolean; onDecline: () => void }) {
  await playResumeReadingPromptAppears({ flushFrame })
  await act(async () => {
    onDecline()
  })
}

const useStoresMock = jest.fn()
const useModalMock = jest.fn()
const mockSyncReadingPosition = jest.fn().mockResolvedValue({ kind: "ok" })
const mockGetBookFileUrl = jest.fn(
  (bookId: number, format: string, size: number, hash: number, path: string, libraryId: string) =>
    `http://calibrelocal/book-file/${bookId}/${format}/${size}/${hash}/${path}?library_id=${libraryId}`,
)
const mockFetchWithAuth = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  headers: { get: () => "image/png" },
  blob: async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
})
const mockSetCoverBinary = jest.fn().mockResolvedValue({ kind: "ok" })

mock.module("@/models", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("/home/amka78/open-bookshelf/app/models/index.ts", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("@/services/api", () => ({
  api: {
    syncReadingPosition: mockSyncReadingPosition,
    getBookFileUrl: (...args: Parameters<typeof mockGetBookFileUrl>) => mockGetBookFileUrl(...args),
    fetchWithAuth: (...args: Parameters<typeof mockFetchWithAuth>) => mockFetchWithAuth(...args),
    setCoverBinary: (...args: Parameters<typeof mockSetCoverBinary>) =>
      mockSetCoverBinary(...args),
  },
}))

mock.module("/home/amka78/open-bookshelf/app/services/api/index.ts", () => ({
  api: {
    syncReadingPosition: mockSyncReadingPosition,
    getBookFileUrl: (...args: Parameters<typeof mockGetBookFileUrl>) => mockGetBookFileUrl(...args),
    fetchWithAuth: (...args: Parameters<typeof mockFetchWithAuth>) => mockFetchWithAuth(...args),
    setCoverBinary: (...args: Parameters<typeof mockSetCoverBinary>) =>
      mockSetCoverBinary(...args),
  },
}))

mock.module("../../hooks/useConvergence", () => ({
  useConvergence: jest.fn(),
}))

mock.module("react-native-modalfy", () => ({
  useModal: () => useModalMock(),
  modalfy: jest.fn(),
}))

mock.module(
  "/home/amka78/open-bookshelf/node_modules/react-native-modalfy/lib/commonjs/index.js",
  () => ({
    useModal: () => useModalMock(),
    modalfy: jest.fn(),
  }),
)

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
    hash: 123,
    metaData: {
      selectedFormat: "pdf",
      size: 100,
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
  const originalElectrobunFlag = window.__ELECTROBUN__

  const getLastModalArgs = <T>(modalName: string) => {
    const matchedCall = [...mockOpenModal.mock.calls]
      .reverse()
      .find(([calledModalName]) => calledModalName === modalName)

    return matchedCall?.[1] as T | undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useStoresMock.mockReturnValue({
      calibreRootStore: mockCalibreRootStore,
    })
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })
    window.__ELECTROBUN__ = false
    useModalMock.mockReturnValue({
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
    window.__ELECTROBUN__ = originalElectrobunFlag
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

  test("onPageChange calls syncReadingPosition after debounce", async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onPageChange(5)
    })

    expect(mockSyncReadingPosition).not.toHaveBeenCalled()

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockSyncReadingPosition).toHaveBeenCalledWith("lib-1", 1, "pdf", 5)
    jest.useRealTimers()
  })

  test("onPageChange debounces rapid page changes and only syncs final page", async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onPageChange(3)
      await result.current.onPageChange(4)
      await result.current.onPageChange(5)
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockSyncReadingPosition).toHaveBeenCalledTimes(1)
    expect(mockSyncReadingPosition).toHaveBeenCalledWith("lib-1", 1, "pdf", 5)
    jest.useRealTimers()
  })

  test("onPageChange does not sync when page is unchanged", async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onPageChange(2) // same as mockHistory.currentPage
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockSyncReadingPosition).not.toHaveBeenCalled()
    jest.useRealTimers()
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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

  test("sets the cover when source page path is available", async () => {
    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(1)
    })

    expect(mockGetBookFileUrl).toHaveBeenCalledWith(1, "pdf", 100, 123, "page2.png", "lib-1")
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "http://calibrelocal/book-file/1/pdf/100/123/page2.png?library_id=lib-1",
      expect.objectContaining({ method: "GET" }),
    )
    expect(mockSetCoverBinary).toHaveBeenCalledWith("lib-1", 1, expect.any(Blob))
  })

  test("opens an error modal when source page path is unavailable", async () => {
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            path: [],
            update: mockUpdate,
          },
        },
        readingHistories: [
          { ...mockHistory, cachedPath: [] },
        ],
      },
    })

    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(2)
    })

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      }),
    )
  })

  test("uses cachedPathList when selectedBook.path is empty", async () => {
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            path: [],
            update: mockUpdate,
          },
        },
        readingHistories: [
          {
            ...mockHistory,
            cachedPath: [
              "http://calibrelocal/book-file/1/pdf/100/123/page1.png?library_id=lib-1",
              "http://calibrelocal/book-file/1/pdf/100/123/page2.png?library_id=lib-1",
            ],
          },
        ],
      },
    })

    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(0)
    })

    // Should fetch the full URL directly from cachedPathList (no getBookFileUrl needed)
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "http://calibrelocal/book-file/1/pdf/100/123/page1.png?library_id=lib-1",
      expect.objectContaining({ method: "GET" }),
    )
    expect(mockSetCoverBinary).toHaveBeenCalledWith("lib-1", 1, expect.any(Blob))
  })

  test("opens an error modal when cover update fails", async () => {
    // Both setCoverBinary and the data URL fallback (selectedBook.update) must fail
    mockSetCoverBinary.mockResolvedValueOnce({ kind: "rejected" })
    mockUpdate.mockResolvedValueOnce(false)

    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(1)
    })

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      }),
    )
  })

  test("falls back to data URL update when setCoverBinary fails", async () => {
    mockSetCoverBinary.mockResolvedValueOnce({ kind: "rejected" })
    mockUpdate.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useViewer())

    let returnValue: boolean | undefined
    await act(async () => {
      returnValue = await result.current.onSetCoverByPage(1)
    })

    expect(mockSetCoverBinary).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith(
      "lib-1",
      expect.objectContaining({ cover: expect.stringContaining("data:") }),
      ["cover"],
    )
    expect(returnValue).toBe(true)
  })

  test("opens an error modal when source page is not an image", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "text/html" },
      blob: async () =>
        new Blob([new TextEncoder().encode("<html></html>")], { type: "text/html" }),
    })

    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(1)
    })

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      }),
    )
  })

  test("rejects HTML spine paths (AZW3/KF8) for cover", async () => {
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          ...mockSelectedLibrary,
          selectedBook: {
            ...mockSelectedBook,
            path: ["Text/chapter-1.xhtml", "Text/chapter-2.xhtml"],
            update: mockUpdate,
          },
        },
        readingHistories: [mockHistory],
      },
    })

    const { result } = renderHook(() => useViewer())

    await act(async () => {
      await result.current.onSetCoverByPage(0)
    })

    expect(mockFetchWithAuth).not.toHaveBeenCalled()
    expect(mockOpenModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      }),
    )
  })

  test("creates default client setting if not found", () => {
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
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
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        readingHistories: [],
      },
    })

    const { result } = renderHook(() => useViewer())

    expect(result.current.initialPage).toBe(0)
  })
})
