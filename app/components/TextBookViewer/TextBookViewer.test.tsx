import { vi, afterEach, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
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

  test("maps persisted text spine page counts back to the correct spine page", () => {
    render(
      <TextBookViewer
        viewerHook={createViewerHook({
          initialPage: 4,
          textSpinePageCounts: [3, 2],
        }) as never}
      />,
    )

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")
    expect(latestTextBookSpineProps?.currentPage).toBe(1)
    expect(latestTextBookSpineProps?.preferredWritingMode).toBe("vertical-rl")
    expect(screen.getByTestId("text-book-viewer-page-manager").getAttribute("data-total-page")).toBe("5")
  })

  test("passes spine-local location details to onPageChange", () => {
    render(
      <TextBookViewer
        viewerHook={createViewerHook({
          initialPage: 4,
          textSpinePageCounts: [3, 2],
        }) as never}
      />,
    )

    expect(onPageChange).toHaveBeenCalledWith(
      4,
      5,
      [3, 2],
      {
        spineIndex: 1,
        pageInSpine: 1,
        estimatedSpinePageCounts: [3, 2],
      },
    )
  })

  test("applies server resume progress within the current spine after pagination is measured", async () => {
    render(
      <TextBookViewer
        viewerHook={createViewerHook({
          initialPage: 1,
          resumeSpineLocation: {
            spineIndex: 1,
            progressInSpine: 0.75,
          },
        }) as never}
      />,
    )

    expect(latestTextBookSpineProps?.pagePath).toBe("text/chapter-2.xhtml")
    expect(latestTextBookSpineProps?.currentPage).toBe(0)

    await act(async () => {
      ;(latestTextBookSpineProps?.onPaginationChange as ((payload: { currentPage: number; totalPages: number }) => void) | undefined)?.({
        currentPage: 0,
        totalPages: 5,
      })
    })

    expect(latestTextBookSpineProps?.currentPage).toBe(3)
  })
})
