import { useBreakpointValue } from "@gluestack-ui/themed"
import { renderHook } from "@testing-library/react"
import * as ScreenOrientation from "expo-screen-orientation"
import { useConvergence } from "./useConvergence"
import useOrientation from "./useOrientation"

jest.mock("./useOrientation")
jest.mock("@gluestack-ui/themed", () => ({
  useBreakpointValue: jest.fn(),
}))

describe("useConvergent test", () => {
  test("If screen is large, orientation is always horizontal", () => {
    ;(useBreakpointValue as jest.Mock).mockReturnValue(true)
    ;(useOrientation as jest.Mock).mockReturnValue(ScreenOrientation.Orientation.PORTRAIT_UP)

    const { result } = renderHook(() => useConvergence())

    expect(result.current.isLarge).toBeTruthy()
    expect(result.current.orientation).toBe("horizontal")
  })
})
