import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const usePDFViewerMock = jest.fn()
const useViewerMock = jest.fn()
const fileExistsMock = jest.fn()
const fileBase64Mock = jest.fn()
const loggerWarnMock = jest.fn()
const loggerErrorMock = jest.fn()

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/screens/PDFViewerScreen/usePDFViewer", () => ({
  usePDFViewer: () => usePDFViewerMock(),
}))

mock.module("@/screens/ViewerScreen/useViewer", () => ({
  useViewer: () => useViewerMock(),
}))

mock.module("@/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: (...args: unknown[]) => loggerWarnMock(...args),
    error: (...args: unknown[]) => loggerErrorMock(...args),
  },
}))

mock.module("expo-file-system", () => ({
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

mock.module("@/library/PDF/Pdf", () => ({
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

mock.module("@/library/PDF/PDFWebPage", () => ({
  PDFWebPage: ({ uri }: { uri: string }) => <div data-testid="pdf-page-count" data-uri={uri} />,
}))

mock.module("@/components", () => ({
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
}))

let PDFViewerScreen: typeof import("./PDFViewerScreen").PDFViewerScreen

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("PDFViewerScreen", () => {
  beforeAll(async () => {
    ;({ PDFViewerScreen } = await import("./PDFViewerScreen"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    fileBase64Mock.mockResolvedValue("ZmFrZS1iYXNlNjQ=")

    useViewerMock.mockReturnValue({
      initialPage: 2,
      onPageChange: jest.fn(),
    })

    usePDFViewerMock.mockReturnValue({
      selectedBook: {
        metaData: {
          title: "Cached PDF",
        },
      },
      totalPages: 7,
      setTotalPages: jest.fn(),
      sourceUri: "file:///cache/book.pdf",
      remoteUri: "https://server.example/book.pdf",
      windowDimension: { width: 320, height: 480 },
      calculatePageDimensions: jest.fn(() => ({ width: 320, height: 480 })),
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
      setTotalPages: jest.fn(),
      sourceUri: "file:///cache/book.pdf",
      remoteUri: "https://server.example/book.pdf",
      windowDimension: { width: 320, height: 480 },
      calculatePageDimensions: jest.fn(() => ({ width: 320, height: 480 })),
      header: { Authorization: "Basic token" },
    })

    await act(async () => {
      render(<PDFViewerScreen />)
    })

    expect(screen.getByTestId("pdf-page-count").getAttribute("data-uri")).toBe("file:///cache/book.pdf")
  })
})
