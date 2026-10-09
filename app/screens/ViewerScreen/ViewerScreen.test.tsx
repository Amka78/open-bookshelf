import { vi, afterEach, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = vi.fn()
const useNavigationMock = vi.fn()
const useViewerMock = vi.fn()
const useViewerPreparationMock = vi.fn()

vi.doMock("@/models", () => ({
  useStores: useStoresMock,
}))

vi.doMock("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
}))

vi.doMock("./useViewer", () => ({
  useViewer: () => useViewerMock(),
}))

vi.doMock("./useViewerPreparation", () => ({
  useViewerPreparation: () => useViewerPreparationMock(),
}))

vi.doMock("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
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
      pageType: "singlePage"
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
      {renderPage?.({
        page: initialPage ?? 0,
        pageType: "singlePage",
        availableWidth: 320,
        availableHeight: 480,
        onPress: () => {},
        onLongPress: () => {},
      })}
    </div>
  ),
  LabeledSpinner: ({ labelTx }: { labelTx?: string }) => (
    <div data-testid="viewer-screen-loading" data-label-tx={labelTx} />
  ),
  TextBookViewer: () => <div data-testid="viewer-screen-text-book-viewer" />,
}

;(global as { __componentsMock?: Record<string, unknown> }).__componentsMock = componentsMock

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

vi.doMock("@/components/BookHtmlPage", () => ({
  BookHtmlPage: () => <div data-testid="viewer-screen-html-page" />,
}))

let ViewerScreen: typeof import("./ViewerScreen").ViewerScreen

beforeAll(async () => {
  ;({ ViewerScreen } = await import("./ViewerScreen"))
})

describe("ViewerScreen", () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigationMock.mockReturnValue({ navigate })
    useViewerPreparationMock.mockReturnValue({
      messageTx: "viewerPreparation.preparing",
      phase: "ready",
    })
    useStoresMock.mockReturnValue({
      authenticationStore: {
        getHeader: vi.fn().mockReturnValue({ Authorization: "Basic token" }),
      },
    })
    useViewerMock.mockReturnValue({
      selectedLibrary: {
        id: "library-1",
      },
      selectedBook: {
        id: 1,
        path: ["page-1.jpg", "page-2.jpg"],
        hash: 101,
        metaData: {
          selectedFormat: "EPUB",
          title: "Sample Book",
          formatSizes: new Map([["EPUB", 120]]),
        },
      },
      initialPage: 1,
      viewerReady: true,
      cachedPathList: ["file:///cache/page-1.jpg", "file:///cache/page-2.jpg"],
      onPageChange: vi.fn(),
      onLastPage: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
  })

  test("shows preparation progress before the viewer becomes ready", () => {
    useViewerPreparationMock.mockReturnValue({
      messageTx: "viewerPreparation.converting",
      phase: "preparing",
    })

    render(<ViewerScreen />)

    expect(screen.getByTestId("viewer-screen-loading").getAttribute("data-label-tx")).toBe(
      "viewerPreparation.converting",
    )
  })

  test("renders the book viewer when preparation is complete", () => {
    render(<ViewerScreen />)

    const viewer = screen.getByTestId("viewer-screen-book-viewer")
    expect(viewer.getAttribute("data-book-title")).toBe("Sample Book")
    expect(viewer.getAttribute("data-initial-page")).toBe("1")
    expect(viewer.getAttribute("data-total-page")).toBe("2")
    expect(screen.getByTestId("viewer-screen-book-page")).toBeTruthy()
  })

  test("renders serialized html pages with TextBookViewer", () => {
    useViewerMock.mockReturnValue({
      selectedLibrary: {
        id: "library-1",
      },
      selectedBook: {
        id: 1,
        path: ["text/chapter-1/index.html"],
        hash: 101,
        metaData: {
          selectedFormat: "EPUB",
          title: "Sample Book",
          formatSizes: new Map([["EPUB", 120]]),
        },
      },
      initialPage: 0,
      viewerReady: true,
      cachedPathList: undefined,
      onPageChange: vi.fn(),
      onLastPage: vi.fn(),
    })

    render(<ViewerScreen />)

    expect(screen.getByTestId("viewer-screen-text-book-viewer")).toBeTruthy()
  })

  test("navigates back to Library when no selected book is available", () => {
    useViewerMock.mockReturnValue({
      selectedLibrary: null,
      selectedBook: null,
      initialPage: 0,
      viewerReady: true,
      cachedPathList: undefined,
      onPageChange: vi.fn(),
      onLastPage: vi.fn(),
    })

    render(<ViewerScreen />)

    expect(navigate).toHaveBeenCalledWith("Library")
  })
})
