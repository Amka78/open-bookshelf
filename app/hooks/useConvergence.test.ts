import { vi, describe as baseDescribe, test as baseTest, beforeAll, expect } from "vitest"
import { localizeTestRegistrar } from "../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseOrientation = vi.fn()
const mockUseBreakpointValue = vi.fn()
const mockScreenOrientation = {
  Orientation: {
    PORTRAIT_UP: 1,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
}

vi.doMock("@/hooks/useOrientation", () => ({
  default: mockUseOrientation,
}))

vi.doMock("expo-screen-orientation", () => mockScreenOrientation)

vi.doMock("@gluestack-ui/themed", () => ({
  useBreakpointValue: mockUseBreakpointValue,
  Box: "div",
  HStack: "div",
  VStack: "div",
  View: "div",
  Text: "span",
  Heading: "h1",
  ScrollView: "div",
  Pressable: "button",
  Input: "div",
  InputField: "input",
  Button: "button",
  ButtonText: "span",
  ButtonSpinner: "span",
  Center: "div",
  Spinner: "div",
  Switch: "input",
  Slider: "div",
  SliderTrack: "div",
  SliderFilledTrack: "div",
  SliderThumb: "div",
  Menu: "div",
  MenuItem: "div",
  MenuItemLabel: "span",
  Modal: "div",
  ModalContent: "div",
  ModalHeader: "div",
  ModalBody: "div",
  ModalFooter: "div",
  ModalCloseButton: "button",
  Tooltip: "div",
  TooltipContent: "div",
  TooltipText: "span",
  Image: "img",
  GluestackUIProvider: ({ children }: { children: unknown }) => children,
  ChevronDownIcon: "span",
  styled: vi.fn((component: unknown) => component),
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
