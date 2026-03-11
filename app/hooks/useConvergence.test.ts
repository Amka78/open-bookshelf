import { describe as baseDescribe, test as baseTest, beforeAll, expect, jest, mock } from "bun:test"
import { localizeTestRegistrar } from "../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseOrientation = jest.fn()
const mockUseBreakpointValue = jest.fn()
const mockScreenOrientation = {
  Orientation: {
    PORTRAIT_UP: 1,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
}

mock.module("@/hooks/useOrientation", () => ({
  default: mockUseOrientation,
}))

mock.module("expo-screen-orientation", () => mockScreenOrientation)

mock.module("@gluestack-ui/themed", () => ({
  useBreakpointValue: mockUseBreakpointValue,
}))

let useConvergence: typeof import("./useConvergence").useConvergence

beforeAll(async () => {
  ;({ useConvergence } = await import("./useConvergence"))
})

describe("useConvergent test", () => {
  test("If screen is large, orientation is always horizontal", () => {
    mockUseBreakpointValue.mockReturnValue(true)
    mockUseOrientation.mockReturnValue(mockScreenOrientation.Orientation.PORTRAIT_UP)

    const result = useConvergence()

    expect(result.isLarge).toBeTruthy()
    expect(result.orientation).toBe("horizontal")
  })
})
