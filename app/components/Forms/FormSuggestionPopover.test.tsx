import { fireEvent, render, waitFor } from "@testing-library/react"
import { type ComponentType, type ReactNode, forwardRef } from "react"
import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  vi,
} from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

let platformOS: "android" | "web" = "web"
const useKeyboardVisibilityMock = vi.fn()

function applyFormSuggestionPopoverMocks() {
  vi.doMock("react-native", () => ({
    Platform: {
      get OS() {
        return platformOS
      },
      select: (obj: Record<string, unknown>) => obj[platformOS] ?? obj.default,
    },
  }))

  vi.doMock("@/hooks/useKeyboardVisibility", () => ({
    useKeyboardVisibility: () => useKeyboardVisibilityMock(),
  }))

  vi.doMock("@/theme", () => ({
    usePalette: vi.fn().mockReturnValue({
      surface: "#111",
      borderStrong: "#333",
      accent: "#999",
    }),
  }))

  vi.doMock("@/components/Box/Box", () => ({
    Box: forwardRef<
      HTMLDivElement,
      Record<string, unknown> & { children?: ReactNode; testID?: string }
    >(({ children, testID, ...props }, ref) => (
      <div ref={ref} data-testid={testID} {...(props as object)}>
        {children}
      </div>
    )),
  }))

  vi.doMock("@/components/Text/Text", () => ({
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

  vi.doMock("@/components/Pressable/Pressable", () => ({
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

  vi.doMock("@/components/Popover/Popover", () => ({
    Popover: ({
      children,
      trigger,
      useRNModal,
    }: {
      children?: ReactNode
      trigger: (triggerProps: Record<string, unknown>) => ReactNode
      useRNModal?: boolean
    }) => (
      <div
        data-testid="form-suggestion-popover-root"
        data-use-rn-modal={String(Boolean(useRNModal))}
      >
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
}

applyFormSuggestionPopoverMocks()

let resolveSuggestionPopoverPlacement: typeof import("./formSuggestionPlacement").resolveSuggestionPopoverPlacement

beforeAll(async () => {
  applyFormSuggestionPopoverMocks()
  ;({ resolveSuggestionPopoverPlacement } = await import("./formSuggestionPlacement"))
})

beforeEach(() => {
  applyFormSuggestionPopoverMocks()
  vi.clearAllMocks()
  platformOS = "web"
  document.body.innerHTML = ""
  useKeyboardVisibilityMock.mockReturnValue({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  })
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

async function loadFormSuggestionPopover(): Promise<
  ComponentType<{
    trigger: (triggerProps: Record<string, unknown>) => ReactNode
    isOpen: boolean
    onClose: () => void
    candidates: string[]
    onSelect: (candidate: string) => void
    testIdPrefix: string
  }>
> {
  applyFormSuggestionPopoverMocks()
  // bun 版は `?test=<nonce>` でキャッシュバスティングしていたが、Vitest はテンプレートリテラルの
  // 動的 import を静的解析できず "Unknown variable dynamic import" になる。resetModules で代替する。
  vi.resetModules()
  const imported = await import("./FormSuggestionPopover.tsx")
  return imported.FormSuggestionPopover
}

describe("FormSuggestionPopover", () => {
  test("uses top placement when keyboard is visible", () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 300,
    })

    const placement = resolveSuggestionPopoverPlacement(true)

    expect(placement).toBe("top left")
  })

  test("selects a candidate on press in for native popovers", async () => {
    platformOS = "android"
    const onSelect = vi.fn()
    const FormSuggestionPopover = await loadFormSuggestionPopover()

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

  test("renders web suggestions in a portal attached to document.body", async () => {
    platformOS = "web"
    const onSelect = vi.fn()
    const FormSuggestionPopover = await loadFormSuggestionPopover()

    const { container } = render(
      <FormSuggestionPopover
        trigger={() => <div data-testid="form-suggestion-trigger" />}
        isOpen={true}
        onClose={() => {}}
        candidates={["Alpha"]}
        onSelect={onSelect}
        testIdPrefix="form-suggestion-test"
      />,
    )

    const trigger = container.querySelector('[data-testid="form-suggestion-trigger"]')
    const triggerContainer = trigger?.parentElement

    Object.defineProperty(triggerContainer, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 120,
        height: 30,
        left: 40,
        right: 220,
        top: 90,
        width: 180,
        x: 40,
        y: 90,
        toJSON: () => ({}),
      }),
    })

    fireEvent.scroll(window)

    await waitFor(() => {
      expect(container.querySelector('[data-testid="form-suggestion-test-suggestions"]')).toBeNull()
      expect(
        document.body.querySelector('[data-testid="form-suggestion-test-suggestions"]'),
      ).not.toBeNull()
    })

    fireEvent.click(
      document.body.querySelector('[data-testid="form-suggestion-test-suggestion-Alpha"]')!,
    )

    expect(onSelect).toHaveBeenCalledWith("Alpha")
  })
})
