import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

let platformOS: "android" | "web" = "web"
const useKeyboardVisibilityMock = jest.fn()

mock.module("react-native", () => ({
  Platform: {
    get OS() {
      return platformOS
    },
    select: (obj: Record<string, unknown>) => obj[platformOS] ?? obj.default,
  },
}))

mock.module("@/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: () => useKeyboardVisibilityMock(),
}))

mock.module("@/theme", () => ({
  usePalette: jest.fn().mockReturnValue({
    surface: "#111",
    borderStrong: "#333",
    accent: "#999",
  }),
}))

mock.module("@/components/Box/Box", () => ({
  Box: ({
    children,
    testID,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>
      {children}
    </div>
  ),
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({
    children,
    testID,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <span data-testid={testID} {...(props as object)}>
      {children}
    </span>
  ),
}))

mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({
    children,
    onPress,
    onPressIn,
    testID,
    ...props
  }: {
    children?: ReactNode
    onPress?: () => void
    onPressIn?: () => void
    testID?: string
  }) => (
    <button
      data-testid={testID}
      {...(props as object)}
      type="button"
      onMouseDown={() => {
        onPressIn?.()
      }}
      onClick={() => {
        onPress?.()
      }}
    >
      {children}
    </button>
  ),
}))

mock.module("@/components/Popover/Popover", () => ({
  Popover: ({
    children,
    trigger,
    useRNModal,
  }: {
    children?: ReactNode
    trigger: (triggerProps: Record<string, unknown>) => ReactNode
    useRNModal?: boolean
  }) => (
    <div data-testid="form-suggestion-popover-root" data-use-rn-modal={String(Boolean(useRNModal))}>
      {trigger({})}
      {children}
    </div>
  ),
  PopoverBackdrop: ({
    onPress,
    testID,
  }: {
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      backdrop
    </button>
  ),
  PopoverContent: ({
    children,
    testID,
  }: {
    children?: ReactNode
    testID?: string
  }) => <div data-testid={testID}>{children}</div>,
  PopoverBody: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let resolveSuggestionPopoverPlacement: typeof import("./formSuggestionPlacement").resolveSuggestionPopoverPlacement
let FormSuggestionPopover: ComponentType<{
  trigger: (triggerProps: Record<string, unknown>) => ReactNode
  isOpen: boolean
  onClose: () => void
  candidates: string[]
  onSelect: (candidate: string) => void
  testIdPrefix: string
}>

beforeAll(async () => {
  ;({ resolveSuggestionPopoverPlacement } = await import("./formSuggestionPlacement"))
  ;({ FormSuggestionPopover } = await import("./FormSuggestionPopover"))
})

beforeEach(() => {
  jest.clearAllMocks()
  platformOS = "web"
  useKeyboardVisibilityMock.mockReturnValue({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  })
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("FormSuggestionPopover", () => {
  test("uses top placement when keyboard is visible", () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 300,
    })

    const placement = resolveSuggestionPopoverPlacement(true)

    expect(placement).toBe("top left")
  })

  test("selects a candidate on press in for native popovers", () => {
    platformOS = "android"
    const onSelect = jest.fn()

    const { getByTestId } = render(
      <FormSuggestionPopover
        trigger={() => <div data-testid="form-suggestion-trigger" />}
        isOpen={true}
        onClose={() => {}}
        candidates={["Alpha"]}
        onSelect={onSelect}
        testIdPrefix="form-suggestion-test"
      />,
    )

    expect(getByTestId("form-suggestion-popover-root").getAttribute("data-use-rn-modal")).toBe(
      "true",
    )
    fireEvent.mouseDown(getByTestId("form-suggestion-test-suggestion-Alpha"))

    expect(onSelect).toHaveBeenCalledWith("Alpha")
  })
})
