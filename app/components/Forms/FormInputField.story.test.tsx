import {
  beforeAll,
  describe as baseDescribe,
  jest,
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

mock.module("./FormSuggestionPopover", () => ({
  FormSuggestionPopover: ({
    trigger,
    isOpen,
    onClose,
    candidates,
    onSelect,
    backdropTestID,
    suggestionsTestID,
    candidateTestIDPrefix,
  }: {
    trigger: (props: Record<string, unknown>) => ReactNode
    isOpen: boolean
    onClose: () => void
    candidates: string[]
    onSelect: (candidate: string) => void
    backdropTestID?: string
    suggestionsTestID?: string
    candidateTestIDPrefix?: string
  }) => (
    <>
      {trigger({})}
      {isOpen ? (
        <div>
          <button data-testid={backdropTestID} type="button" onClick={onClose}>
            backdrop
          </button>
          <div data-testid={suggestionsTestID}>
            {candidates.map((candidate) => (
              <button
                key={candidate}
                data-testid={`${candidateTestIDPrefix}-${encodeURIComponent(candidate)}`}
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
