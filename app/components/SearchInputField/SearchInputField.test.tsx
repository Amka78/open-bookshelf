import { describe as baseDescribe, test as baseTest, beforeAll, jest, mock } from "bun:test"
import { render, screen, fireEvent } from "@testing-library/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { SearchInputField } from "./SearchInputField"

// Mock dependencies
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
    ...props
  }: Record<string, unknown> & {
    testID?: string
    value?: string
    onChange?: (e: any) => void
    onFocus?: () => void
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
      {...(props as object)}
    />
  ),
}))

mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: ({
    testID,
    ...props
  }: Record<string, unknown> & { testID?: string }) => (
    <button data-testid={testID} {...(props as object)} />
  ),
}))

mock.module("@/components/Popover/Popover", () => ({
  Popover: () => null,
  PopoverBackdrop: () => null,
  PopoverContent: () => null,
  PopoverBody: () => null,
}))

localizeTestRegistrar("SearchInputField")

function SearchInputFieldTestWrapper({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue ?? "")
  const suggestions = [
    "title:=",
    "title:~",
    "title:!=",
    "title:!~",
    "authors:=",
    "authors:~",
    "authors:!=",
    "authors:!~",
    "series:=",
    "AND",
    "OR",
    "NOT",
  ]

  return (
    <div>
      <SearchInputField
        value={value}
        onChangeText={setValue}
        suggestions={suggestions}
        width="100%"
        testID="search-input-story"
        placeholder="Type to search..."
      />
      <div data-testid="current-value">Value: {value}</div>
    </div>
  )
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("SearchInputField backspace functionality", () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  test("backspace removes text from authors:=", async () => {
    render(<SearchInputFieldTestWrapper initialValue="authors:=" />)

    const input = screen.getByTestId("search-input-story")
    expect(input).toHaveValue("authors:=")

    // Simulate backspace - should remove "="
    fireEvent.change(input, { target: { value: "authors:" } })
    expect(input).toHaveValue("authors:")

    // Simulate another backspace - should remove ":"
    fireEvent.change(input, { target: { value: "authors" } })
    expect(input).toHaveValue("authors")

    // Simulate another backspace - should remove "s"
    fireEvent.change(input, { target: { value: "author" } })
    expect(input).toHaveValue("author")
  })

  test("backspace works with colon-suffix selection", async () => {
    render(<SearchInputFieldTestWrapper initialValue="authors:" />)

    const input = screen.getByTestId("search-input-story")
    expect(input).toHaveValue("authors:")

    // Simulate backspace - should remove ":"
    fireEvent.change(input, { target: { value: "authors" } })
    expect(input).toHaveValue("authors")
  })

  test("backspace works with operator-suffix selection", async () => {
    render(<SearchInputFieldTestWrapper initialValue="title:~" />)

    const input = screen.getByTestId("search-input-story")
    expect(input).toHaveValue("title:~")

    // Simulate backspace - should remove "~"
    fireEvent.change(input, { target: { value: "title:" } })
    expect(input).toHaveValue("title:")
  })
})
