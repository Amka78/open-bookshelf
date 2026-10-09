import { act, renderHook } from "@testing-library/react"
import { useViewerMenuState } from "./useViewerMenuState"

describe("useViewerMenuState", () => {
  test("initializes state from props", () => {
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle: vi.fn(),
        onSelectPageDirection: vi.fn(),
      }),
    )

    expect(result.current.pageDirectionState).toBeDefined()
    expect(result.current.readingStyleState).toBeDefined()
  })

  test("updates reading style", () => {
    const onSelectReadingStyle = vi.fn()
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle,
        onSelectPageDirection: vi.fn(),
      }),
    )

    act(() => {
      result.current.onUpdateReadingStyle("facingPage")
    })

    expect(onSelectReadingStyle).toHaveBeenCalled()
  })

  test("toggles page direction", () => {
    const onSelectPageDirection = vi.fn()
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle: vi.fn(),
        onSelectPageDirection,
      }),
    )

    act(() => {
      result.current.onTogglePageDirection()
    })

    expect(onSelectPageDirection).toHaveBeenCalled()
  })
})
