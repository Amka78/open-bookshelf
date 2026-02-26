import { act, renderHook } from "@testing-library/react"
import { useViewerMenuState } from "./useViewerMenuState"

describe("useViewerMenuState", () => {
  test("initializes state from props", () => {
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle: jest.fn(),
        onSelectPageDirection: jest.fn(),
      }),
    )

    expect(result.current.pageDirectionState).toBeDefined()
    expect(result.current.readingStyleState).toBeDefined()
  })

  test("updates reading style", () => {
    const onSelectReadingStyle = jest.fn()
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle,
        onSelectPageDirection: jest.fn(),
      }),
    )

    act(() => {
      result.current.onUpdateReadingStyle("facingPage")
    })

    expect(onSelectReadingStyle).toHaveBeenCalled()
  })

  test("toggles page direction", () => {
    const onSelectPageDirection = jest.fn()
    const { result } = renderHook(() =>
      useViewerMenuState({
        pageDirection: "left",
        readingStyle: "singlePage",
        onSelectReadingStyle: jest.fn(),
        onSelectPageDirection,
      }),
    )

    act(() => {
      result.current.onTogglePageDirection()
    })

    expect(onSelectPageDirection).toHaveBeenCalled()
  })
})
