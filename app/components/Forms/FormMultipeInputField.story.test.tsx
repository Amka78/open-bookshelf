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
  playMultipleFocusShowsSuggestions,
  playMultipleBackdropPressClosesSuggestions,
  playMultipleOutsideClickClosesSuggestions,
  playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput,
  playMultipleSelectSuggestionUpdatesInput,
  playMultipleSuggestionsStayVisibleAfterFocus,
  playMultipleTypingKeepsSuggestionsVisible,
  playMultipleTypingFiltersSuggestions,
} from "./formMultipleInputFieldStoryPlay"

mock.module("@/theme", () => ({
  usePalette: () => ({
    surface: "#111",
    borderStrong: "#333",
    accent: "#999",
  }),
}))

mock.module("@/components", () => ({
  Box: ({ children, testID, ...props }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>{children}</div>
  ),
  Image: ({ testID, ...props }: Record<string, unknown> & { testID?: string }) => (
    <img data-testid={testID} {...(props as object)} />
  ),
  Text: ({ children, testID, ...props }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <span data-testid={testID} {...(props as object)}>{children}</span>
  ),
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
  VStack: ({ children, testID, ...props }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>{children}</div>
  ),
  Input: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
  IconButton: ({ testID, onPress }: { testID?: string; onPress?: () => void }) => (
    <button data-testid={testID} type="button" onClick={onPress}>icon</button>
  ),
}))

mock.module("@/components/Box/Box", () => ({
  Box: ({ children, testID, ...props }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>{children}</div>
  ),
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({ children, testID, ...props }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <span data-testid={testID} {...(props as object)}>{children}</span>
  ),
}))

mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({ children, onPress, testID, ...props }: { children?: ReactNode; onPress?: () => void; testID?: string }) => (
    <button data-testid={testID} {...(props as object)} type="button" onClick={onPress}>{children}</button>
  ),
}))

mock.module("./FormSuggestionPopover", () => ({
  FormSuggestionPopover: ({
    trigger,
    isOpen,
    onClose,
    candidates,
    onSelect,
    testIdPrefix,
  }: {
    trigger: (props: Record<string, unknown>) => ReactNode
    isOpen: boolean
    onClose: () => void
    candidates: string[]
    onSelect: (candidate: string) => void
    testIdPrefix: string
  }) => (
    <>
      {trigger({})}
      {isOpen ? (
        <div>
          <button data-testid={`${testIdPrefix}-backdrop`} type="button" onClick={onClose}>backdrop</button>
          <div data-testid={`${testIdPrefix}-suggestions`}>
            {candidates.map((candidate) => (
              <button
                key={candidate}
                data-testid={`${testIdPrefix}-suggestion-${encodeURIComponent(candidate)}`}
                type="button"
                onClick={() => onSelect(candidate)}
              >
                {candidate}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
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
  tags: string[]
}

let FormMultipleInputField: ComponentType<{
  control: ReturnType<typeof useForm<StoryForm>>["control"]
  name: "tags"
  suggestions: string[]
  width: "$full"
  testID: string
  textToValue: string
  valueToText: string
}>

beforeAll(async () => {
  const imported = await import("./FormMultipeInputField")
  FormMultipleInputField = imported.FormMultipleInputField as typeof FormMultipleInputField
})

function TestHarness({ suggestions }: { suggestions: string[] }) {
  const form = useForm<StoryForm>({
    defaultValues: {
      tags: [""],
    },
  })

  return (
    <>
      <FormMultipleInputField
        control={form.control}
        name="tags"
        suggestions={suggestions}
        width="$full"
        testID="form-multiple-input-story"
        textToValue=","
        valueToText=","
      />
      <button data-testid="form-multiple-input-story-outside" type="button">
        Outside
      </button>
    </>
  )
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("FormMultipleInputField story play", () => {
  test("focus shows suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleFocusShowsSuggestions({ canvasElement: container })
  })

  test("suggestions stay visible after focus", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSuggestionsStayVisibleAfterFocus({ canvasElement: container })
  })

  test("typing filters suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleTypingFiltersSuggestions({ canvasElement: container })
  })

  test("typing keeps suggestions visible", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleTypingKeepsSuggestionsVisible({ canvasElement: container })
  })

  test("selecting suggestion updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSelectSuggestionUpdatesInput({ canvasElement: container })
  })

  test("selecting suggestion closes suggestions and updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput({ canvasElement: container })
  })

  test("outside click closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleOutsideClickClosesSuggestions({ canvasElement: container })
  })

  test("backdrop press closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleBackdropPressClosesSuggestions({ canvasElement: container })
  })
})
