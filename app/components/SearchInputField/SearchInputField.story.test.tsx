import { beforeAll, describe as baseDescribe, test as baseTest, jest, mock } from "bun:test"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playBackspaceRemovesText,
  playBlurClosesSuggestions,
  playFocusShowsSuggestions,
  playSelectSuggestionClosesSuggestions,
  playTypingFiltersSuggestions,
  playTypingKeepsSuggestionsVisible,
} from "./SearchInputField.storyPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

mock.module("@/theme", () => ({
  usePalette: jest.fn().mockReturnValue({
    surface: "#111",
    borderStrong: "#333",
    accent: "#999",
    textPrimary: "#000",
    borderSubtle: "#222",
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

mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({
    children,
    testID,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <button data-testid={testID} type="button" {...(props as object)}>
      {children}
    </button>
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

mock.module("@gluestack-ui/themed", () => ({
  HStack: ({
    children,
    testID,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>
      {children}
    </div>
  ),
  Input: ({
    children,
    testID,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID} {...(props as object)}>
      {children}
    </div>
  ),
}))

mock.module("@/components/Forms/FormSuggestionPopover", () => ({
  FormSuggestionPopover: ({
    trigger,
    isOpen,
    onClose,
    candidates,
    onSelect,
    testIdPrefix,
    backdropTestID,
    suggestionsTestID,
    candidateTestIDPrefix,
  }: Record<string, unknown> & {
    trigger: (props: Record<string, unknown>) => ReactNode
    isOpen: boolean
    onClose: () => void
    candidates: string[]
    onSelect: (candidate: string) => void
    testIdPrefix: string
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
                data-testid={`${candidateTestIDPrefix ?? `${testIdPrefix}-suggestion`}-${encodeURIComponent(candidate)}`}
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

mock.module("@/components/InputField/InputField", () => ({
  InputField: ({
    testID,
    value,
    onChange,
    onFocus,
    onBlur,
    ...props
  }: Record<string, unknown> & {
    testID?: string
    value?: string
    onChange?: (e: { nativeEvent: { text: string }; target: EventTarget & HTMLInputElement }) => void
    onFocus?: () => void
    onBlur?: () => void
  }) => (
    <input
      data-testid={testID}
      value={value ?? ""}
      onChange={(e) => {
        onChange?.({
          nativeEvent: { text: e.target.value },
          target: e.target,
        })
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      {...(props as object)}
    />
  ),
}))

mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: ({
    testID,
    ...props
  }: Record<string, unknown> & { testID?: string }) => (
    <button data-testid={testID} type="button" {...(props as object)} />
  ),
}))

let SearchInputFieldStoryWrapper: typeof import("./SearchInputField.stories").SearchInputFieldStoryWrapper

beforeAll(async () => {
  ;({ SearchInputFieldStoryWrapper } = await import("./SearchInputField.stories"))
})

describe("SearchInputField story play", () => {
  test("focus shows suggestions", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playFocusShowsSuggestions({ canvasElement: container })
  })

  test("typing keeps suggestions visible", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playTypingKeepsSuggestionsVisible({ canvasElement: container })
  })

  test("typing filters suggestions", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playTypingFiltersSuggestions({ canvasElement: container })
  })

  test("selecting a suggestion closes suggestions", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playSelectSuggestionClosesSuggestions({ canvasElement: container })
  })

  test("blur closes suggestions", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playBlurClosesSuggestions({ canvasElement: container })
  })

  test("backspace removes text", async () => {
    const { container } = render(<SearchInputFieldStoryWrapper />)
    await playBackspaceRemovesText({ canvasElement: container })
  })
})
