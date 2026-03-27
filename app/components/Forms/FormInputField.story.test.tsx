import {
  beforeAll,
  describe as baseDescribe,
  mock,
  test as baseTest,
} from "bun:test"
import { render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { useForm } from "react-hook-form"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playBackdropPressClosesSuggestions,
  playFocusShowsSuggestions,
  playOutsideClickClosesSuggestions,
  playSelectSuggestionClosesSuggestionsAndUpdatesInput,
  playSelectSuggestionUpdatesInput,
  playSuggestionsStayVisibleAfterFocus,
  playTypingKeepsSuggestionsVisible,
  playTypingFiltersSuggestions,
} from "./formInputFieldStoryPlay"

mock.module("@/theme", () => ({
  usePalette: () => ({
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
    onPressIn,
    onPress,
    testID,
    ...props
  }: {
    children?: ReactNode
    onPressIn?: () => void
    onPress?: () => void
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
    trigger,
    isOpen,
    children,
  }: {
    trigger: (props: Record<string, unknown>) => ReactNode
    isOpen?: boolean
    children?: ReactNode
  }) => (
    <>
      {trigger({})}
      {isOpen ? <div data-testid="mock-popover">{children}</div> : null}
    </>
  ),
  PopoverContent: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
  PopoverBody: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  PopoverBackdrop: ({
    children,
    onPress,
    testID,
  }: {
    children?: ReactNode
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      {children}
    </button>
  ),
}))

mock.module("../InputField/InputField", () => ({
  InputField: ({
    onChangeText,
    value,
    onFocus,
    onBlur,
    testID,
  }: {
    onChangeText?: (text: string) => void
    value?: string
    onFocus?: () => void
    onBlur?: () => void
    testID?: string
  }) => (
    <input
      data-testid={testID}
      value={value ?? ""}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={(event) => {
        onChangeText?.((event.currentTarget as HTMLInputElement).value)
      }}
      onChange={(event) => {
        onChangeText?.(event.currentTarget.value)
      }}
    />
  ),
}))

type StoryForm = {
  title: string | null
}

let FormInputField: ComponentType<{
  control: ReturnType<typeof useForm<StoryForm>>["control"]
  name: "title"
  suggestions: string[]
  width: "$full"
  testID: string
}>

beforeAll(async () => {
  const imported = await import("./FormInputField")
  FormInputField = imported.FormInputField as typeof FormInputField
})

function TestHarness({ suggestions }: { suggestions: string[] }) {
  const form = useForm<StoryForm>({
    defaultValues: {
      title: null,
    },
  })

  return (
    <>
      <FormInputField
        control={form.control}
        name="title"
        suggestions={suggestions}
        width="$full"
        testID="form-input-story-input"
      />
      <button data-testid="form-input-story-outside" type="button">
        Outside
      </button>
    </>
  )
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("FormInputField story play", () => {
  test("focus shows suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playFocusShowsSuggestions({
      canvasElement: container,
    })
  })

  test("suggestions stay visible after focus", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playSuggestionsStayVisibleAfterFocus({
      canvasElement: container,
    })
  })

  test("typing filters suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playTypingFiltersSuggestions({
      canvasElement: container,
    })
  })

  test("typing keeps suggestions visible", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playTypingKeepsSuggestionsVisible({
      canvasElement: container,
    })
  })

  test("selecting suggestion updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playSelectSuggestionUpdatesInput({
      canvasElement: container,
    })
  })

  test("selecting suggestion closes suggestions and updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playSelectSuggestionClosesSuggestionsAndUpdatesInput({
      canvasElement: container,
    })
  })

  test("outside click closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playOutsideClickClosesSuggestions({
      canvasElement: container,
    })
  })

  test("backdrop press closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)

    await playBackdropPressClosesSuggestions({
      canvasElement: container,
    })
  })
})
