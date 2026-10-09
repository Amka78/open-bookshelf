import { vi, afterAll, afterEach, describe as baseDescribe, test as baseTest, beforeAll, beforeEach, expect } from "vitest"
import { act, cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import * as _realUsePDFViewerNs from "./usePDFViewer"

// Snapshot the real usePDFViewer BEFORE mocking (top-level imports are hoisted, so this
// runs before vi.module calls which are also hoisted but after static imports in Bun).
const _realUsePDFViewer = Object.assign({}, _realUsePDFViewerNs)

const usePDFViewerMock = vi.fn()
const useViewerMock = vi.fn()
const useViewerPreparationMock = vi.fn()
const fileExistsMock = vi.fn()
const fileBase64Mock = vi.fn()
const loggerWarnMock = vi.fn()
const loggerErrorMock = vi.fn()

vi.doMock("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

vi.doMock("@/screens/PDFViewerScreen/usePDFViewer", () => ({
  usePDFViewer: () => usePDFViewerMock(),
}))

vi.doMock("@/screens/ViewerScreen/useViewer", () => ({
  useViewer: () => useViewerMock(),
}))

vi.doMock("@/screens/ViewerScreen/useViewerPreparation", () => ({
  useViewerPreparation: () => useViewerPreparationMock(),
}))

vi.doMock("@/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: (...args: unknown[]) => loggerWarnMock(...args),
    error: (...args: unknown[]) => loggerErrorMock(...args),
  },
}))

vi.doMock("expo-file-system", () => ({
  File: class MockFile {
    exists: boolean

    constructor(public uri: string) {
      this.exists = fileExistsMock(uri)
    }

    base64() {
      return fileBase64Mock(this.uri)
    }
  },
}))

vi.doMock("@/library/PDF/Pdf", () => ({
  PDF: ({
    source,
    page,
    singlePage,
  }: {
    source: { uri: string }
    page?: number
    singlePage?: boolean
  }) => (
    <div
      data-testid={singlePage ? "pdf-page" : "pdf-hidden"}
      data-page={page ?? -1}
      data-uri={source.uri}
    />
  ),
}))

vi.doMock("@/library/PDF/PDFWebPage", () => ({
  PDFWebPage: ({ uri }: { uri: string }) => <div data-testid="pdf-page-count" data-uri={uri} />,
}))

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  LabeledSpinner: ({
    labelTx,
  }: {
    labelTx?: string
  }) => <div data-testid="pdf-viewer-loading" data-label-tx={labelTx} />,
  BookViewer: ({
    bookTitle,
    totalPage,
    initialPage,
    renderPage,
  }: {
    bookTitle: string
    totalPage: number
    initialPage?: number
    renderPage: (props: {
      page: number
      direction: "next" | "previous"
      pageType: "singlePage" | "leftPage" | "rightPage"
      scrollIndex: number
      availableWidth: number
      availableHeight: number
    }) => ReactNode
  }) => (
    <div
      data-testid="book-viewer"
      data-book-title={bookTitle}
      data-initial-page={initialPage ?? -1}
      data-total-page={totalPage}
    >
      {renderPage({
        page: initialPage ?? 0,
        direction: "next",
        pageType: "singlePage",
        scrollIndex: initialPage ?? 0,
        availableWidth: 320,
        availableHeight: 480,
      })}
    </div>
  ),
  Text: ({ children, tx, style }: { children?: ReactNode; tx?: string; style?: unknown }) => (
    <div data-style={JSON.stringify(style)}>{tx ?? children}</div>
  ),
}

;(global as { __componentsMock?: Record<string, unknown> }).__componentsMock = componentsMock

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

let PDFViewerScreen: typeof import("./PDFViewerScreen").PDFViewerScreen

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("PDFViewerScreen", () => {
  beforeAll(async () => {
    ;({ PDFViewerScreen } = await import("./PDFViewerScreen"))
  })

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    fileBase64Mock.mockResolvedValue("ZmFrZS1iYXNlNjQ=")
    useViewerPreparationMock.mockReturnValue({
      messageTx: "viewerPreparation.preparing",
      phase: "ready",
    })

    useViewerMock.mockReturnValue({
      initialPage: 2,
      onPageChange: vi.fn(),
    })

    usePDFViewerMock.mockReturnValue({
      selectedBook: {
        metaData: {
          title: "Cached PDF",
        },
      },
      totalPages: 7,
      setTotalPages: vi.fn(),
      sourceUri: "file:///cache/book.pdf",
      remoteUri: "https://server.example/book.pdf",
      windowDimension: { width: 320, height: 480 },
      calculatePageDimensions: vi.fn(() => ({ width: 320, height: 480 })),
      header: { Authorization: "Basic token" },
    })
  })

  test("cached PDF がある場合はローカルファイルを表示する", async () => {
    fileExistsMock.mockReturnValue(true)

    await act(async () => {
      render(<PDFViewerScreen />)
    })

    expect(screen.getByTestId("book-viewer")).toBeTruthy()
    expect(screen.getByTestId("pdf-page").getAttribute("data-uri")).toBe("file:///cache/book.pdf")
  })

  test("cached PDF が消えている場合は remoteUri にフォールバックする", async () => {
    fileExistsMock.mockReturnValue(false)

    await act(async () => {
      render(<PDFViewerScreen />)
    })

    expect(screen.getByTestId("book-viewer")).toBeTruthy()
    expect(screen.getByTestId("pdf-page").getAttribute("data-uri")).toBe(
      "https://server.example/book.pdf",
    )
    expect(loggerWarnMock).toHaveBeenCalled()
  })

  test("totalPages 未確定時は hidden WebView で総ページ数取得を試みる", async () => {
    fileExistsMock.mockReturnValue(true)
    usePDFViewerMock.mockReturnValue({
      selectedBook: {
        metaData: {
          title: "Cached PDF",
        },
      },
      totalPages: undefined,
      setTotalPages: vi.fn(),
      sourceUri: "file:///cache/book.pdf",
      remoteUri: "https://server.example/book.pdf",
      windowDimension: { width: 320, height: 480 },
      calculatePageDimensions: vi.fn(() => ({ width: 320, height: 480 })),
      header: { Authorization: "Basic token" },
    })

    await act(async () => {
      render(<PDFViewerScreen />)
    })

    expect(screen.getByTestId("pdf-page-count").getAttribute("data-uri")).toBe(
      "file:///cache/book.pdf",
    )
  })

  test("preparing 中はローディングと進行メッセージを表示する", async () => {
    useViewerPreparationMock.mockReturnValue({
      messageTx: "viewerPreparation.cachingPdf",
      phase: "preparing",
    })

    await act(async () => {
      render(<PDFViewerScreen />)
    })

    expect(screen.getByTestId("pdf-viewer-loading").getAttribute("data-label-tx")).toBe(
      "viewerPreparation.cachingPdf",
    )
  })
})

afterAll(() => {
  // Restore the real usePDFViewer so usePDFViewer.test.ts can use it
  vi.doMock("@/screens/PDFViewerScreen/usePDFViewer", () => _realUsePDFViewer)
})
