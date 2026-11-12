import { vi, beforeAll, beforeEach, describe, expect, test } from "vitest"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { BookModel } from "@/models/calibre"

/**
 * アノテーション保存がストアを更新したあと、UI（アノテーションパネル・スパイン）へ
 * 伝播することを検証する。useAnnotations をモックせず、実 MST ストア + 実 useAnnotations
 * を使うことで、mobx の購読（observer）が機能しているかを実測する。
 *
 * 背景: TextBookViewer は annotations をレンダー中に読むが observer でラップされて
 * いないと、selectedBook.setAnnotations() で配列が置き換わっても再レンダリングされず、
 * パネル一覧・本文ハイライトが保存直後に反映されない（修正対象のバグ）。
 */

const usePaletteMock = vi.fn()
const useStoresMock = vi.fn()
const useNavigationMock = vi.fn()
const useModalMock = vi.fn()
const mockOpenModal = vi.fn()
const mockSaveAnnotations = vi.fn()

let latestViewerHeaderProps: Record<string, unknown> | null = null
let latestAnnotationPanelProps: Record<string, unknown> | null = null
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

vi.doMock("@/services/api", () => ({
  api: {
    saveAnnotations: mockSaveAnnotations,
  },
}))

vi.doMock("@/components", () => ({
  GradientBackground: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  PageManager: () => <div data-testid="page-manager" />,
  ViewerHeader: (props: Record<string, unknown>) => {
    latestViewerHeaderProps = props
    return <div data-testid="viewer-header" />
  },
}))

vi.doMock("@/components/AnnotationPanel", () => ({
  AnnotationPanel: (props: Record<string, unknown>) => {
    latestAnnotationPanelProps = props
    return <div data-testid="annotation-panel" />
  },
}))

vi.doMock("./TextBookSpine", () => ({
  TextBookSpine: (props: Record<string, unknown>) => {
    latestTextBookSpineProps = props
    return <div data-testid="text-book-spine" />
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

const makeBook = () =>
  BookModel.create({
    id: 1,
    metaData: {
      title: "Test AZW3",
      authors: [],
      formats: ["AZW3"],
      formatSizes: { AZW3: 100 },
      tags: [],
      rating: 0,
      size: 100,
      comments: "",
      publisher: "",
      seriesIndex: null,
      timestamp: "",
      pubdate: "",
      sort: "",
      authorSort: "",
      uuid: "",
      cover: "",
      series: "",
      lastModified: "",
      selectedFormat: "AZW3",
      identifiers: {},
    },
    path: ["text/chapter-1.xhtml", "text/chapter-2.xhtml"],
    spineItemLengths: [100, 100],
    primaryWritingMode: "vertical-rl",
    hash: 101,
    pageProgressionDirection: null,
  })

const createViewerHook = (book: ReturnType<typeof makeBook>) => ({
  selectedBook: book,
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
  onPageChange: vi.fn(),
  onLastPage: vi.fn(),
  toc: null,
  goToTocEntry: vi.fn(),
})

const setupStore = (book: ReturnType<typeof makeBook>) => {
  useStoresMock.mockReturnValue({
    calibreRootStore: {
      selectedLibrary: { id: "library-1", selectedBook: book },
    },
    settingStore: {
      autoPageTurnIntervalMs: 1500,
      setAutoPageTurnIntervalMs: vi.fn(),
    },
  })
}

/** 直近の openModal 呼び出しから AnnotationModal の params を取り出す */
const lastAnnotationModalParams = () =>
  mockOpenModal.mock.calls[mockOpenModal.mock.calls.length - 1][1] as {
    selectedText?: string
    onSave: (args: { text?: string; notes: string; styleWhich: string }) => Promise<void>
  }

describe("TextBookViewer annotation reactivity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    latestViewerHeaderProps = null
    latestAnnotationPanelProps = null
    latestTextBookSpineProps = null
    usePaletteMock.mockReturnValue({ gradient: ["#000", "#111"] })
    useNavigationMock.mockReturnValue({ goBack: vi.fn() })
    useModalMock.mockReturnValue({ openModal: mockOpenModal })
    mockSaveAnnotations.mockResolvedValue({ kind: "ok" })
  })

  test("saved bookmark appears in the annotation panel and spine props without manual re-render", async () => {
    const book = makeBook()
    setupStore(book)

    render(<TextBookViewer viewerHook={createViewerHook(book) as never} />)

    // パネルを先に開いておいても、保存後に一覧へ反映される必要がある。
    act(() => {
      ;(latestViewerHeaderProps?.onToggleAnnotationPanel as () => void)?.()
    })
    expect(latestAnnotationPanelProps?.annotations).toHaveLength(0)

    // ヘッダーの「しおりを追加」→ AnnotationModal → 保存
    act(() => {
      ;(latestViewerHeaderProps?.onAddBookmark as () => void)?.()
    })
    expect(mockOpenModal).toHaveBeenCalledWith(
      "AnnotationModal",
      expect.objectContaining({ onSave: expect.any(Function) }),
    )
    await act(async () => {
      await lastAnnotationModalParams().onSave({ notes: "my bookmark", styleWhich: "yellow" })
    })

    // ストアは更新されている
    expect(book.annotations.length).toBe(1)
    expect(book.annotations[0].type).toBe("bookmark")

    // 保存後の自動再レンダリングで UI へ伝播する
    expect(latestAnnotationPanelProps?.annotations).toHaveLength(1)
    expect(latestTextBookSpineProps?.annotations).toHaveLength(1)
  })

  test("saved highlight reaches the spine so the new document can paint it", async () => {
    const book = makeBook()
    setupStore(book)

    render(<TextBookViewer viewerHook={createViewerHook(book) as never} />)

    // テキスト選択 → AnnotationModal → 保存
    act(() => {
      ;(latestTextBookSpineProps?.onTextSelect as (text: string) => void)?.("選択したテキスト")
    })
    expect(mockOpenModal).toHaveBeenCalledWith(
      "AnnotationModal",
      expect.objectContaining({ selectedText: "選択したテキスト" }),
    )
    await act(async () => {
      await lastAnnotationModalParams().onSave({
        text: "選択したテキスト",
        notes: "",
        styleWhich: "green",
      })
    })

    expect(book.annotations).toHaveLength(1)
    expect(book.annotations[0].type).toBe("highlight")
    expect(book.annotations[0].styleWhich).toBe("green")

    // スパインへ新しい annotations が渡り、document 再構築でハイライト描画される
    const spineAnnotations = latestTextBookSpineProps?.annotations as Array<{ uuid: string }>
    expect(spineAnnotations).toHaveLength(1)
  })
})
