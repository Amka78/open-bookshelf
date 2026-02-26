import { act, renderHook } from "@testing-library/react-hooks"
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

    expect(result.current.pageDirectionState).toBe("left")
    expect(result.current.readingStyleState).toBe("singlePage")
  })

  test("updates reading style and invokes callback", () => {
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

    expect(onSelectReadingStyle).toHaveBeenCalledWith("facingPage")
    expect(result.current.readingStyleState).toBe("facingPage")
  })

  test("toggles page direction and invokes callback", () => {
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

    expect(onSelectPageDirection).toHaveBeenCalledWith("right")
    expect(result.current.pageDirectionState).toBe("right")
  })
})
