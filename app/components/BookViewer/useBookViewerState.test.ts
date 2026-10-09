import { renderHook } from "@testing-library/react"
import {
  type FlashListHandle,
  createPageStyles,
  getListIndexForPage,
  useBookViewerState,
} from "./useBookViewerState"

describe("useBookViewerState", () => {
  const createFlashListRef = () => {
    return {
      current: {
        scrollToIndex: vi.fn(),
      },
    } as React.RefObject<FlashListHandle>
  }

  test("creates hook successfully for single page mode", () => {
    const flashListRef = createFlashListRef()

    const { result } = renderHook(() =>
      useBookViewerState({
        totalPage: 3,
        initialPage: 0,
        readingStyle: "singlePage",
        onPageChange: vi.fn(),
        onLastPage: vi.fn(),
        initialAutoPageTurnIntervalMs: 1000,
        flashListRef,
      }),
    )

    expect(result.current).toBeDefined()
  })

  test("creates hook successfully for facing page mode", () => {
    const flashListRef = createFlashListRef()

    const { result } = renderHook(() =>
      useBookViewerState({
        totalPage: 5,
        initialPage: 0,
        readingStyle: "facingPage",
        onPageChange: vi.fn(),
        onLastPage: vi.fn(),
        initialAutoPageTurnIntervalMs: 1000,
        flashListRef,
      }),
    )

    expect(result.current).toBeDefined()
  })

  test("hook supports auto page turning", () => {
    const flashListRef = createFlashListRef()

    const { result } = renderHook(() =>
      useBookViewerState({
        totalPage: 3,
        initialPage: 0,
        readingStyle: "singlePage",
        onPageChange: vi.fn(),
        onLastPage: vi.fn(),
        initialAutoPageTurnIntervalMs: 500,
        flashListRef,
      }),
    )

    expect(result.current.setAutoPageTurning).toBeDefined()
  })
})

describe("getListIndexForPage", () => {
  test("singlePage / verticalScroll はページ番号がそのまま index になる", () => {
    const pages = createPageStyles(100)

    expect(getListIndexForPage(pages, "singlePage", 0, 100)).toBe(0)
    expect(getListIndexForPage(pages, "singlePage", 50, 100)).toBe(50)
    expect(getListIndexForPage(pages, "singlePage", 99, 100)).toBe(99)
    expect(getListIndexForPage(pages, "verticalScroll", 50, 100)).toBe(50)
  })

  test("facingPageWithTitle は表紙が単独、以降は2ページずつ詰まる", () => {
    const pages = createPageStyles(174)

    // {p1:0}, {p1:1,p2:2}, {p1:3,p2:4} … なので page 43 は index 22 の {p1:43,p2:44}
    expect(getListIndexForPage(pages, "facingPageWithTitle", 0, 174)).toBe(0)
    expect(getListIndexForPage(pages, "facingPageWithTitle", 1, 174)).toBe(1)
    expect(getListIndexForPage(pages, "facingPageWithTitle", 2, 174)).toBe(1)
    expect(getListIndexForPage(pages, "facingPageWithTitle", 43, 174)).toBe(22)
    expect(getListIndexForPage(pages, "facingPageWithTitle", 44, 174)).toBe(22)
  })

  test("facingPage は表紙も2ページ目に含める", () => {
    const pages = createPageStyles(10)

    // {p1:0,p2:1}, {p1:2,p2:3} …
    expect(getListIndexForPage(pages, "facingPage", 0, 10)).toBe(0)
    expect(getListIndexForPage(pages, "facingPage", 1, 10)).toBe(0)
    expect(getListIndexForPage(pages, "facingPage", 2, 10)).toBe(1)
  })

  test("範囲外のページは端にクランプされる", () => {
    const pages = createPageStyles(10)

    expect(getListIndexForPage(pages, "singlePage", 999, 10)).toBe(9)
    expect(getListIndexForPage(pages, "singlePage", -5, 10)).toBe(0)
  })

  test("0ページの本でも index 0 を返す", () => {
    const pages = createPageStyles(0)

    expect(getListIndexForPage(pages, "singlePage", 0, 0)).toBe(0)
    expect(getListIndexForPage(pages, "facingPageWithTitle", 7, 0)).toBe(0)
  })
})
