import { act, renderHook, waitFor } from "@testing-library/react"
import useOrientation from "./useOrientation"
import {
  Orientation,
  addOrientationChangeListener,
  getOrientationAsync,
  removeOrientationChangeListener,
} from "expo-screen-orientation"

jest.mock("expo-screen-orientation", () => ({
  Orientation: {
    UNKNOWN: 0,
    PORTRAIT_UP: 1,
    PORTRAIT_DOWN: 2,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
  addOrientationChangeListener: jest.fn(),
  getOrientationAsync: jest.fn(),
  removeOrientationChangeListener: jest.fn(),
}))

describe("useOrientation", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("loads initial orientation", async () => {
    ;(getOrientationAsync as jest.Mock).mockResolvedValue(Orientation.LANDSCAPE_LEFT)
    ;(addOrientationChangeListener as jest.Mock).mockReturnValue({ id: 1 })

    const { result } = renderHook(() => useOrientation())

    await waitFor(() => {
      expect(result.current).toBe(Orientation.LANDSCAPE_LEFT)
    })
  })

  test("updates orientation and runs callback when orientation changes", async () => {
    const onOrientationChange = jest.fn()
    let listener: ((event: { orientationInfo: { orientation: Orientation } }) => void) | undefined
    ;(getOrientationAsync as jest.Mock).mockResolvedValue(Orientation.PORTRAIT_UP)
    ;(addOrientationChangeListener as jest.Mock).mockImplementation((cb) => {
      listener = cb
      return { id: 2 }
    })

    const { result } = renderHook(() => useOrientation(onOrientationChange))

    await waitFor(() => {
      expect(result.current).toBe(Orientation.PORTRAIT_UP)
    })

    act(() => {
      listener?.({ orientationInfo: { orientation: Orientation.LANDSCAPE_RIGHT } })
    })

    await waitFor(() => {
      expect(result.current).toBe(Orientation.LANDSCAPE_RIGHT)
    })
    expect(onOrientationChange).toHaveBeenCalledWith(Orientation.LANDSCAPE_RIGHT)
  })

  test("removes orientation listener on unmount", () => {
    const subscription = { id: 3 }
    ;(getOrientationAsync as jest.Mock).mockResolvedValue(Orientation.UNKNOWN)
    ;(addOrientationChangeListener as jest.Mock).mockReturnValue(subscription)

    const { unmount } = renderHook(() => useOrientation())
    unmount()

    expect(removeOrientationChangeListener).toHaveBeenCalledWith(subscription)
  })
})
