import { useConvergence } from "./useConvergence"
import useOrientation from "./useOrientation"
import { useBreakpointValue } from "@gluestack-ui/themed"

jest.mock("./useOrientaton")
describe("useConvergent test", () => {
  test("If screen is large, orientation is always horizontal", () => {
    jest.mock("@gluestack-ui/themed", () => {
      useBreakpointValue: jest.fn().mockReturnValue(true)
    })

    jest.mock("./useOrientation", () => {
      3
    })

    const convergenceHook = useConvergence()

    expect(convergenceHook.isLarge).toBeTruthy()
    expect(convergenceHook.orientation).toBe("horizontal")
  })
})
