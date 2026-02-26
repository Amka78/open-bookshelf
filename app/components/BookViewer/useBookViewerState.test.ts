import { act, renderHook } from "@testing-library/react-hooks"
import { type FlashListHandle, useBookViewerState } from "./useBookViewerState"

describe("useBookViewerState", () => {
  const createFlashListRef = () => {
    return {
      current: {
        scrollToIndex: jest.fn(),
      },
    } as React.RefObject<FlashListHandle>
  }

  test("creates page data for single page mode", async () => {
    const flashListRef = createFlashListRef()

    const { result, waitForNextUpdate } = renderHook(() =>
      useBookViewerState({
        totalPage: 3,
        initialPage: 0,
        readingStyle: "singlePage",
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
        initialAutoPageTurnIntervalMs: 1000,
        flashListRef,
      }),
    )

    await waitForNextUpdate()

    expect(result.current.data.length).toBe(3)
  })

  test("maps facing page index to current page", async () => {
    const flashListRef = createFlashListRef()

    const { result, waitForNextUpdate } = renderHook(() =>
      useBookViewerState({
        totalPage: 5,
        initialPage: 0,
        readingStyle: "facingPage",
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
        initialAutoPageTurnIntervalMs: 1000,
        flashListRef,
      }),
    )

    await waitForNextUpdate()

    act(() => {
      result.current.scrollToIndex(1)
    })

    expect(result.current.currentPage).toBe(2)
  })

  test("auto page turning advances scroll index", async () => {
    const flashListRef = createFlashListRef()

    const { result, waitForNextUpdate } = renderHook(() =>
      useBookViewerState({
        totalPage: 3,
        initialPage: 0,
        readingStyle: "singlePage",
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
        initialAutoPageTurnIntervalMs: 500,
        flashListRef,
      }),
    )

    await waitForNextUpdate()

    act(() => {
      result.current.setAutoPageTurning(true)
    })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(flashListRef.current?.scrollToIndex).toHaveBeenCalled()
  })
})
