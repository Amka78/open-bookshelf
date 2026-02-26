import { renderHook } from "@testing-library/react"
import { type FlashListHandle, useBookViewerState } from "./useBookViewerState"

describe("useBookViewerState", () => {
  const createFlashListRef = () => {
    return {
      current: {
        scrollToIndex: jest.fn(),
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
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
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
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
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
        onPageChange: jest.fn(),
        onLastPage: jest.fn(),
        initialAutoPageTurnIntervalMs: 500,
        flashListRef,
      }),
    )

    expect(result.current.setAutoPageTurning).toBeDefined()
  })
})
