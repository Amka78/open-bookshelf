import {
  afterAll,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render, screen, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  createViewerScreenFrameScheduler,
  playViewerScreenResumePromptOpensOnce,
} from "./viewerScreenPlay"

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useModalMock = jest.fn()
const useConvergenceMock = jest.fn()

mock.module("@/models", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: () => useNavigationMock(),
  createNavigationContainerRef: () => ({
    isReady: () => false,
    canGoBack: () => false,
    goBack: jest.fn(),
    getRootState: jest.fn(),
  }),
}))

mock.module("react-native-modalfy", () => ({
  useModal: () => useModalMock(),
  modalfy: () => useModalMock(),
}))

mock.module("../../hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/components", () => ({
  BookPage: ({ children }: { children?: ReactNode }) => (
    <div data-testid="viewer-screen-book-page">{children}</div>
  ),
  BookViewer: ({ bookTitle }: { bookTitle?: string }) => (
    <div data-testid="viewer-screen-book-viewer">{bookTitle}</div>
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

  beforeAll(async () => {
    ;({ ViewerScreen } = await import("./ViewerScreen"))
  })

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigationMock.mockReturnValue({ navigate })
    useModalMock.mockReturnValue({ openModal })
    useConvergenceMock.mockReturnValue({ isLarge: false, orientation: "vertical" })
    useStoresMock.mockReturnValue({
      authenticationStore: {
        getHeader: jest.fn().mockReturnValue({ Authorization: "Basic token" }),
      },
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
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
          },
          clientSetting: [],
        },
        readingHistories: [
          {
            libraryId: "library-1",
            bookId: 1,
            format: "EPUB",
            currentPage: 2,
            cachedPath: ["cache1.png", "cache2.png", "cache3.png"],
            setCurrentPage: jest.fn(),
          },
        ],
      },
    })
  })

  test("opens the resume reading modal only once even if the screen rerenders", async () => {
    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    const view = render(<ViewerScreen />)

    await act(async () => {
      frames.flushFrame()
      frames.flushFrame()
    })

    expect(openModal).toHaveBeenCalledTimes(1)
    expect(openModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "modal.resumeReadingConfirmModal.title",
        messageTx: "modal.resumeReadingConfirmModal.message",
      }),
    )

    await playViewerScreenResumePromptOpensOnce({
      rerender: () => view.rerender(<ViewerScreen />),
      flushFrame: frames.flushFrame,
    })

    expect(openModal).toHaveBeenCalledTimes(1)
  })

  test("renders the book viewer after confirming resume", async () => {
    const frames = createViewerScreenFrameScheduler()
    globalThis.requestAnimationFrame = frames.requestAnimationFrame
    globalThis.cancelAnimationFrame = frames.cancelAnimationFrame

    render(<ViewerScreen />)

    await act(async () => {
      frames.flushFrame()
      frames.flushFrame()
    })

    const modalArgs = openModal.mock.calls[0]?.[1] as { onOKPress?: () => void } | undefined
    expect(modalArgs?.onOKPress).toBeDefined()

    await act(async () => {
      modalArgs?.onOKPress?.()
    })

    expect(screen.getByTestId("viewer-screen-book-viewer")).toBeTruthy()
  })
})
