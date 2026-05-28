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
import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const usePaletteMock = jest.fn()
const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useModalMock = jest.fn()
const useAnnotationsMock = jest.fn()

let latestTextBookSpineProps: Record<string, unknown> | null = null

mock.module("@/theme", () => ({
  usePalette: usePaletteMock,
}))

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
}))

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useModalMock(),
}))

mock.module("@/screens/ViewerScreen/useAnnotations", () => ({
  useAnnotations: () => useAnnotationsMock(),
}))

mock.module("@/components", () => ({
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

mock.module("@/components/AnnotationPanel", () => ({
  AnnotationPanel: () => <div data-testid="text-book-viewer-annotation-panel" />,
}))

mock.module("./TextBookSpine", () => ({
  TextBookSpine: (props: Record<string, unknown>) => {
    latestTextBookSpineProps = props
    return <div data-testid="text-book-viewer-spine" />
  },
}))

mock.module("react-native", () => ({
  Platform: { OS: "web" },
  Share: { share: jest.fn() },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let TextBookViewer: typeof import("./TextBookViewer").TextBookViewer

beforeAll(async () => {
  ;({ TextBookViewer } = await import("./TextBookViewer"))
})

describe("TextBookViewer", () => {
  const goBack = jest.fn()
  const onPageChange = jest.fn()

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
    onManageMenu: jest.fn(),
    onSetBookReadingStyle: jest.fn(),
    onSetPageDirection: jest.fn(),
    onPageChange,
    onLastPage: jest.fn(),
    toc: null,
    goToTocEntry: jest.fn(),
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    latestTextBookSpineProps = null
    usePaletteMock.mockReturnValue({
      gradient: ["#000000", "#111111"],
    })
    useStoresMock.mockReturnValue({
      settingStore: {
        autoPageTurnIntervalMs: 1500,
        setAutoPageTurnIntervalMs: jest.fn(),
      },
    })
    useNavigationMock.mockReturnValue({ goBack })
    useModalMock.mockReturnValue({ openModal: jest.fn() })
    useAnnotationsMock.mockReturnValue({
      annotations: [],
      addBookmark: jest.fn(),
      addHighlight: jest.fn(),
      deleteAnnotation: jest.fn(),
      exportAnnotationsAsMarkdown: jest.fn(),
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
