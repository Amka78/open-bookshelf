import {
  vi,
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  test as baseTest,
} from "vitest"
import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const usePaletteMock = vi.fn()
const useStoresMock = vi.fn()
const useNavigationMock = vi.fn()
const useModalMock = vi.fn()
const useAnnotationsMock = vi.fn()

let latestTextBookSpineProps: Record<string, unknown> | null = null

vi.doMock("@/theme", () => ({
  usePalette: usePaletteMock,
}))

vi.doMock("@/models", () => ({
  useStores: useStoresMock,
}))

vi.doMock("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
}))

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useModalMock(),
}))

vi.doMock("@/screens/ViewerScreen/useAnnotations", () => ({
  useAnnotations: () => useAnnotationsMock(),
}))

vi.doMock("@/components", () => ({
  GradientBackground: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  PageManager: ({
    currentPage,
    totalPage,
  }: {
    currentPage: number
    totalPage: number
  }) => (
    <div
      data-testid="text-book-viewer-page-manager"
      data-current-page={currentPage}
      data-total-page={totalPage}
    />
  ),
  ViewerHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/components/AnnotationPanel", () => ({
  AnnotationPanel: () => <div data-testid="text-book-viewer-annotation-panel" />,
}))

vi.doMock("./TextBookSpine", () => ({
  TextBookSpine: (props: Record<string, unknown>) => {
    latestTextBookSpineProps = props
    return <div data-testid="text-book-viewer-spine" />
  },
}))

vi.doMock("react-native", () => ({
  Platform: { OS: "web" },
  Share: { share: vi.fn() },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let TextBookViewer: typeof import("./TextBookViewer").TextBookViewer

beforeAll(async () => {
  ;({ TextBookViewer } = await import("./TextBookViewer"))
})

describe("TextBookViewer", () => {
  const goBack = vi.fn()
  const onPageChange = vi.fn()

  const createViewerHook = (overrides: Record<string, unknown> = {}) => ({
    selectedBook: {
      id: 1,
      path: ["text/chapter-1.xhtml", "text/chapter-2.xhtml"],
      spineItemLengths: [100, 100],
      primaryWritingMode: "vertical-rl",
      hash: 101,
      metaData: {
        title: "Sample Book",
        selectedFormat: "AZW3",
        formatSizes: new Map([["AZW3", 100]]),
      },
    },
    selectedLibrary: { id: "library-1" },
    initialPage: 0,
    resumeSpineLocation: null,
    textSpinePageCounts: [],
    readingStyle: "singlePage",
    pageDirection: "left",
    showMenu: false,
    onManageMenu: vi.fn(),
    onSetBookReadingStyle: vi.fn(),
    onSetPageDirection: vi.fn(),
    onPageChange,
    onLastPage: vi.fn(),
    toc: null,
    goToTocEntry: vi.fn(),
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    latestTextBookSpineProps = null
    usePaletteMock.mockReturnValue({
      gradient: ["#000000", "#111111"],
    })
    useStoresMock.mockReturnValue({
      settingStore: {
        autoPageTurnIntervalMs: 1500,
        setAutoPageTurnIntervalMs: vi.fn(),
      },
    })
    useNavigationMock.mockReturnValue({ goBack })
    useModalMock.mockReturnValue({ openModal: vi.fn() })
    useAnnotationsMock.mockReturnValue({
      annotations: [],
      addBookmark: vi.fn(),
      addHighlight: vi.fn(),
      deleteAnnotation: vi.fn(),
      exportAnnotationsAsMarkdown: vi.fn(),
    })
  })

  afterEach(() => {
    latestTextBookSpineProps = null
  })

  test("keeps the turned page when the parent re-renders with an equivalent page count array", () => {
    // useViewer は毎レンダーで textSpinePageCounts を新しい配列として返すため、
    // 参照をそのまま effect の依存にするとページ送りのたびに initialPage へ戻される。
    // 見開き（表紙あり）＋右開きの表紙から次へ進めることを確認する。
    const viewerHook = () =>
      createViewerHook({
        initialPage: 0,
        textSpinePageCounts: [],
        readingStyle: "facingPageWithTitle",
        pageDirection: "left",
      }) as never

    const { rerender } = render(<TextBookViewer viewerHook={viewerHook()} />)

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-1.xhtml")

    act(() => {
      ;(
        latestTextBookSpineProps?.onNavigate as
          | ((payload: { x: number; y: number; width: number; height: number }) => void)
          | undefined
      )?.({ x: 10, y: 10, width: 1920, height: 528 })
    })

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")

    rerender(<TextBookViewer viewerHook={viewerHook()} />)

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")

    // 実測でページ数が変わっても、読んでいる位置は巻き戻さない。
    rerender(
      <TextBookViewer
        viewerHook={
          createViewerHook({
            initialPage: 0,
            textSpinePageCounts: [1, 20],
            readingStyle: "facingPageWithTitle",
            pageDirection: "left",
          }) as never
        }
      />,
    )

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")
  })

  test("keeps the turned page at a 1-page spine boundary when the view reports the spread's left edge", () => {
    // 縦書き見開き（facingPageWithTitle）で、1 ページしかない章（part0004）から次の章
    // （part0005、16 ページ）へ進むと、webview は「奇数ページ要求でも同じスプレッドを表示し、
    // スプレッドの左端（= 偶数 currentPage）を報告する」。その報告で表示ページを書き換えると
    // normalize の丸め（例: 偶数 2 → 1）がスパイン境界をまたいで前の章を指し、再マウントの
    // 無限ループになる（実機ログで part0004 ↔ part0005 を確認）。同じスプレッド内の報告は
    // 巻き戻さないことを確認する。
    const viewerHook = () =>
      createViewerHook({
        selectedBook: {
          id: 1,
          path: ["text/chapter-1.xhtml", "text/part0004.html", "text/part0005.html"],
          spineItemLengths: [100, 10, 1000],
          primaryWritingMode: "vertical-rl",
          hash: 101,
          metaData: {
            title: "Sample Book",
            selectedFormat: "AZW3",
            formatSizes: new Map([["AZW3", 100]]),
          },
        },
        initialPage: 1,
        textSpinePageCounts: [1, 1, 16],
        readingStyle: "facingPageWithTitle",
        pageDirection: "left",
      }) as never

    render(<TextBookViewer viewerHook={viewerHook()} />)
    expect(latestTextBookSpineProps?.pagePath).toBe("text/part0004.html")

    // 次へ進む（右開きなので左側タップ）。part0005 の 1 ページ目が表示される。
    act(() => {
      ;(
        latestTextBookSpineProps?.onNavigate as
          | ((payload: { x: number; y: number; width: number; height: number }) => void)
          | undefined
      )?.({ x: 10, y: 10, width: 1920, height: 528 })
    })

    expect(latestTextBookSpineProps?.pagePath).toBe("text/part0005.html")
    expect(latestTextBookSpineProps?.currentPage).toBe(1)

    // webview がスプレッドの左端（currentPage=0）を報告しても表示ページは巻き戻らない。
    act(() => {
      ;(
        latestTextBookSpineProps?.onPaginationChange as
          | ((payload: { currentPage: number; totalPages: number }) => void)
          | undefined
      )?.({
        currentPage: 0,
        totalPages: 16,
      })
    })

    expect(latestTextBookSpineProps?.pagePath).toBe("text/part0005.html")
    expect(latestTextBookSpineProps?.currentPage).toBe(1)
  })

  test("maps persisted text spine page counts back to the correct spine page", () => {
    render(
      <TextBookViewer
        viewerHook={
          createViewerHook({
            initialPage: 4,
            textSpinePageCounts: [3, 2],
          }) as never
        }
      />,
    )

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")
    expect(latestTextBookSpineProps?.currentPage).toBe(1)
    expect(latestTextBookSpineProps?.preferredWritingMode).toBe("vertical-rl")
    expect(
      screen.getByTestId("text-book-viewer-page-manager").getAttribute("data-total-page"),
    ).toBe("5")
  })

  test("passes spine-local location details to onPageChange", () => {
    render(
      <TextBookViewer
        viewerHook={
          createViewerHook({
            initialPage: 4,
            textSpinePageCounts: [3, 2],
          }) as never
        }
      />,
    )

    expect(onPageChange).toHaveBeenCalledWith(4, 5, [3, 2], {
      spineIndex: 1,
      pageInSpine: 1,
      estimatedSpinePageCounts: [3, 2],
    })
  })

  test("applies server resume progress within the current spine after pagination is measured", async () => {
    render(
      <TextBookViewer
        viewerHook={
          createViewerHook({
            initialPage: 1,
            resumeSpineLocation: {
              spineIndex: 1,
              progressInSpine: 0.75,
            },
          }) as never
        }
      />,
    )

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")
    expect(latestTextBookSpineProps?.currentPage).toBe(0)

    await act(async () => {
      ;(
        latestTextBookSpineProps?.onPaginationChange as
          | ((payload: { currentPage: number; totalPages: number }) => void)
          | undefined
      )?.({
        currentPage: 0,
        totalPages: 5,
      })
    })

    expect(latestTextBookSpineProps?.currentPage).toBe(3)
  })
})
