import { act, renderHook, waitFor } from "@testing-library/react"
import {
  Orientation,
  addOrientationChangeListener,
  getOrientationAsync,
  removeOrientationChangeListener,
} from "expo-screen-orientation"
import useOrientation from "./useOrientation"

vi.mock("expo-screen-orientation", () => ({
  Orientation: {
    UNKNOWN: 0,
    PORTRAIT_UP: 1,
    PORTRAIT_DOWN: 2,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
  addOrientationChangeListener: vi.fn(),
  getOrientationAsync: vi.fn(),
  removeOrientationChangeListener: vi.fn(),
}))

describe("useOrientation", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test("loads initial orientation", async () => {
    ;(getOrientationAsync as vi.Mock).mockResolvedValue(Orientation.LANDSCAPE_LEFT)
    ;(addOrientationChangeListener as vi.Mock).mockReturnValue({ id: 1 })

    const { result } = renderHook(() => useOrientation())

    await waitFor(() => {
      expect(result.current).toBe(Orientation.LANDSCAPE_LEFT)
    })
  })

  test("updates orientation and runs callback when orientation changes", async () => {
    const onOrientationChange = vi.fn()
    let listener: ((event: { orientationInfo: { orientation: Orientation } }) => void) | undefined
    ;(getOrientationAsync as vi.Mock).mockResolvedValue(Orientation.PORTRAIT_UP)
    ;(addOrientationChangeListener as vi.Mock).mockImplementation((cb) => {
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
    ;(getOrientationAsync as vi.Mock).mockResolvedValue(Orientation.UNKNOWN)
    ;(addOrientationChangeListener as vi.Mock).mockReturnValue(subscription)

    const { unmount } = renderHook(() => useOrientation())
    unmount()

    expect(removeOrientationChangeListener).toHaveBeenCalledWith(subscription)
  })
})
