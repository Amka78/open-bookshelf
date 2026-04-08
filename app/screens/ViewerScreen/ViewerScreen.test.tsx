import {
  afterAll,
  afterEach,
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { act, cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

function createViewerScreenFrameScheduler() {
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
      const next = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined
      if (!next) return false
      const [id, callback] = next
      callbacks.delete(id)
      callback(0)
      return true
    },
  }
}

async function playViewerScreenResumePromptAppears({ flushFrame }: { flushFrame: () => boolean }) {
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

async function playViewerScreenResumePromptDoesNotReopenOnRerender({
  rerender,
  flushFrame,
}: { rerender: () => void; flushFrame: () => boolean }) {
  await playViewerScreenResumePromptAppears({ flushFrame })
  await act(async () => {
    rerender()
  })
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

async function playViewerScreenResumePromptAccepts({
  flushFrame,
  onAccept,
}: { flushFrame: () => boolean; onAccept: () => void }) {
  await playViewerScreenResumePromptAppears({ flushFrame })
  await act(async () => {
    onAccept()
  })
}

async function playViewerScreenResumePromptDeclines({
  flushFrame,
  onDecline,
}: { flushFrame: () => boolean; onDecline: () => void }) {
  await playViewerScreenResumePromptAppears({ flushFrame })
  await act(async () => {
    onDecline()
  })
}

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useConvergenceMock = jest.fn()
const useModalMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("/home/amka78/open-bookshelf/app/models/index.ts", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  ...(global as { __navMock?: Record<string, unknown> }).__navMock,
  useNavigation: useNavigationMock,
  createNavigationContainerRef: () => ({
    isReady: () => false,
    canGoBack: () => false,
    goBack: jest.fn(),
    getRootState: jest.fn(),
  }),
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

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useModalMock(),
}))

mock.module("../../hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/components", () => ({
  ...(global as { __componentsMock?: Record<string, unknown> }).__componentsMock,
  BookPage: ({ children }: { children?: ReactNode }) => (
    <div data-testid="viewer-screen-book-page">{children}</div>
  ),
  BookViewer: ({
    bookTitle,
    initialPage,
    totalPage,
    renderPage,
  }: {
    bookTitle?: string
    initialPage?: number
    totalPage?: number
    renderPage?: (props: {
      page: number
      pageType: "single"
      availableWidth: number
      availableHeight: number
      onPress: () => void
      onLongPress: () => void
    }) => ReactNode
  }) => (
    <div
      data-testid="viewer-screen-book-viewer"
      data-book-title={bookTitle}
      data-initial-page={initialPage ?? -1}
      data-total-page={totalPage ?? -1}
    >
      {typeof renderPage === "function"
        ? renderPage({
            page: initialPage ?? 0,
            pageType: "single",
            availableWidth: 320,
            availableHeight: 480,
            onPress: () => {},
            onLongPress: () => {},
          })
        : null}
    </div>
  ),
}))

mock.module("@/components/BookHtmlPage", () => ({
  BookHtmlPage: () => <div data-testid="viewer-screen-html-page" />,
}))

let ViewerScreen: typeof import("./ViewerScreen").ViewerScreen

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ViewerScreen resume modal", () => {
  const openModal = jest.fn()
  const navigate = jest.fn()
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame
  const originalElectrobunFlag = window.__ELECTROBUN__

  const createStoreState = ({
    currentPage = 2,
    selectedBook,
  }: {
    currentPage?: number
    selectedBook?: Record<string, unknown> | null
  } = {}) => ({
    authenticationStore: {
      getHeader: jest.fn().mockReturnValue({ Authorization: "Basic token" }),
    },
    calibreRootStore: {
      selectedLibrary: {
        id: "library-1",
        selectedBook:
          selectedBook === undefined
            ? {
                id: 1,
                path: ["page1.png", "page2.png", "page3.png"],
                hash: 1,
                metaData: {
                  selectedFormat: "EPUB",
                  title: "Sample Book",
                  formatSizes: new Map([["EPUB", 123]]),
                  setProp: jest.fn(),
                },
                update: jest.fn(),
              }
            : selectedBook,
        clientSetting: [],
      },
      readingHistories: [
        {
          libraryId: "library-1",
          bookId: 1,
          format: "EPUB",
          currentPage,
          cachedPath: ["cache1.png", "cache2.png", "cache3.png"],
          setCurrentPage: jest.fn(),
        },
      ],
    },
  })

  const getLastModalArgs = <T,>(modalName: string) => {
    const matchedCall = [...openModal.mock.calls]
      .reverse()
      .find(([calledName]) => calledName === modalName)
    return matchedCall?.[1] as T | undefined
  }

  beforeAll(async () => {
    ;({ ViewerScreen } = await import("./ViewerScreen"))
  })

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
    window.__ELECTROBUN__ = originalElectrobunFlag
  })

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigationMock.mockReturnValue({ navigate })
    window.__ELECTROBUN__ = false
    useModalMock.mockReturnValue({ openModal })
    useConvergenceMock.mockReturnValue({ isLarge: false, orientation: "vertical" })
    useStoresMock.mockReturnValue(createStoreState())
  })

  test("opens the resume reading modal only once even if the screen rerenders", async () => {
    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    const view = render(<ViewerScreen />)

    await playViewerScreenResumePromptAppears({
      flushFrame: frames.flushFrame,
    })

    expect(openModal).toHaveBeenCalledTimes(1)
    expect(openModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "modal.resumeReadingConfirmModal.title",
        messageTx: "modal.resumeReadingConfirmModal.message",
      }),
    )

    await playViewerScreenResumePromptDoesNotReopenOnRerender({
      rerender: () => view.rerender(<ViewerScreen />),
      flushFrame: frames.flushFrame,
    })

    expect(openModal).toHaveBeenCalledTimes(1)
  })

  test("renders the book viewer from the saved page after confirming resume", async () => {
    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    render(<ViewerScreen />)

    await playViewerScreenResumePromptAccepts({
      flushFrame: frames.flushFrame,
      onAccept: () => getLastModalArgs<{ onOKPress: () => void }>("ConfirmModal")?.onOKPress(),
    })

    const viewer = screen.getByTestId("viewer-screen-book-viewer")
    expect(viewer).toBeTruthy()
    expect(viewer.getAttribute("data-initial-page")).toBe("2")
    expect(viewer.getAttribute("data-total-page")).toBe("3")
    expect(screen.getByTestId("viewer-screen-book-page")).toBeTruthy()
  })

  test("starts from the first page after declining the resume modal", async () => {
    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    render(<ViewerScreen />)

    await playViewerScreenResumePromptDeclines({
      flushFrame: frames.flushFrame,
      onDecline: () =>
        getLastModalArgs<{ onCancelPress: () => void }>("ConfirmModal")?.onCancelPress(),
    })

    const viewer = screen.getByTestId("viewer-screen-book-viewer")
    expect(viewer.getAttribute("data-initial-page")).toBe("0")
    expect(viewer.getAttribute("data-total-page")).toBe("3")
  })

  test("renders the viewer immediately without a resume modal when saved progress is at the first page", () => {
    useStoresMock.mockReturnValue(createStoreState({ currentPage: 0 }))

    render(<ViewerScreen />)

    const viewer = screen.getByTestId("viewer-screen-book-viewer")
    expect(viewer.getAttribute("data-initial-page")).toBe("0")
    expect(openModal).not.toHaveBeenCalled()
  })

  test("navigates back to Library when no selected book is available", async () => {
    useStoresMock.mockReturnValue(createStoreState({ selectedBook: null }))

    render(<ViewerScreen />)

    await act(async () => {})

    expect(navigate).toHaveBeenCalledWith("Library")
  })

  test("renders the html page component when the current page path is a serialized html entry", async () => {
    useStoresMock.mockReturnValue(
      createStoreState({
        selectedBook: {
          id: 1,
          path: ["page/page-1/index.html"],
          hash: 1,
          metaData: {
            selectedFormat: "EPUB",
            title: "Sample Book",
            formatSizes: new Map([["EPUB", 123]]),
            setProp: jest.fn(),
          },
          update: jest.fn(),
        },
      }),
    )

    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    render(<ViewerScreen />)

    await playViewerScreenResumePromptAccepts({
      flushFrame: frames.flushFrame,
      onAccept: () => getLastModalArgs<{ onOKPress: () => void }>("ConfirmModal")?.onOKPress(),
    })

    expect(screen.getByTestId("viewer-screen-html-page")).toBeTruthy()
  })
})
