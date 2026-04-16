import {
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useViewerMock = jest.fn()
const useViewerPreparationMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
}))

mock.module("./useViewer", () => ({
  useViewer: () => useViewerMock(),
}))

mock.module("./useViewerPreparation", () => ({
  useViewerPreparation: () => useViewerPreparationMock(),
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/components", () => ({
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
}))

mock.module("@/components/BookHtmlPage", () => ({
  BookHtmlPage: () => <div data-testid="viewer-screen-html-page" />,
}))

let ViewerScreen: typeof import("./ViewerScreen").ViewerScreen

beforeAll(async () => {
  ;({ ViewerScreen } = await import("./ViewerScreen"))
})

describe("ViewerScreen", () => {
  const navigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigationMock.mockReturnValue({ navigate })
    useViewerPreparationMock.mockReturnValue({
      messageTx: "viewerPreparation.preparing",
      phase: "ready",
    })
    useStoresMock.mockReturnValue({
      authenticationStore: {
        getHeader: jest.fn().mockReturnValue({ Authorization: "Basic token" }),
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
      onPageChange: jest.fn(),
      onLastPage: jest.fn(),
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

  test("renders serialized html pages with BookHtmlPage", () => {
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
      onPageChange: jest.fn(),
      onLastPage: jest.fn(),
    })

    render(<ViewerScreen />)

    expect(screen.getByTestId("viewer-screen-html-page")).toBeTruthy()
  })

  test("navigates back to Library when no selected book is available", () => {
    useViewerMock.mockReturnValue({
      selectedLibrary: null,
      selectedBook: null,
      initialPage: 0,
      viewerReady: true,
      cachedPathList: undefined,
      onPageChange: jest.fn(),
      onLastPage: jest.fn(),
    })

    render(<ViewerScreen />)

    expect(navigate).toHaveBeenCalledWith("Library")
  })
})
