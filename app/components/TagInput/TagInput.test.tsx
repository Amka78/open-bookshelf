import { beforeAll, describe as baseDescribe, expect, mock, test as baseTest } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

function normalizeStyle(style: unknown): React.CSSProperties | undefined {
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>(
      (acc, value) => (value && typeof value === "object" ? { ...acc, ...value } : acc),
      {},
    )
  }

  return style && typeof style === "object" ? (style as React.CSSProperties) : undefined
}

const componentsMock = {
  Box: ({
    children,
    style,
    testID,
    onPress,
  }: {
    children?: ReactNode
    style?: unknown
    testID?: string
    onPress?: () => void
  }) => (
    <div
      data-testid={testID}
      onClick={onPress}
      style={normalizeStyle(style)}
    >
      {children}
    </div>
  ),
  HStack: ({ children, style }: { children?: ReactNode; style?: unknown }) => (
    <div style={normalizeStyle(style)}>{children}</div>
  ),
  IconButton: ({
    name,
    onPress,
    testID,
    style,
  }: {
    name?: string
    onPress?: () => void
    testID?: string
    style?: unknown
  }) => (
    <button
      data-testid={testID}
      onClick={onPress}
      style={normalizeStyle(style)}
      type="button"
    >
      {name}
    </button>
  ),
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children, style }: { children?: ReactNode; style?: unknown }) => (
    <span style={normalizeStyle(style)}>{children}</span>
  ),
}

mock.module("@/components", () => componentsMock)

mock.module("@/components/InputField/InputField", () => ({
  InputField: ({
    onBlur,
    onChange,
    onChangeText,
    onFocus,
    onKeyDown,
    testID,
    value,
  }: {
    onBlur?: () => void
    onChange?: (event: unknown) => void
    onChangeText?: (text: string) => void
    onFocus?: () => void
    onKeyDown?: (event: { key: string; preventDefault: () => void }) => void
    testID?: string
    value?: string
  }) => (
    <input
      data-testid={testID}
      onBlur={onBlur}
      onChange={(event) => {
        onChange?.(event)
        onChangeText?.((event.target as HTMLInputElement).value)
      }}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      value={value ?? ""}
    />
  ),
}))

mock.module("@/theme", () => ({
  usePalette: () => ({
    background: "#ffffff",
    backgroundLight: "#f3f4f6",
    border: "#e5e7eb",
    primary: "#3b82f6",
    text: "#000000",
  }),
}))

mock.module("@gluestack-ui/themed", () => ({
  Pressable: ({
    children,
    onPress,
    style,
    testID,
  }: {
    children?: ReactNode
    onPress?: () => void
    style?: unknown
    testID?: string
  }) => (
    <div
      data-testid={testID}
      onClick={onPress}
      style={normalizeStyle(style)}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  ),
}))

mock.module("react-native", () => ({
  Platform: { OS: "web" },
  StyleSheet: {
    create: <T extends Record<string, unknown>>(value: T) => value,
    hairlineWidth: 1,
  },
}))

let TagInput: typeof import("./TagInput").TagInput

beforeAll(async () => {
  const module = await import("./TagInput")
  TagInput = module.TagInput
})

describe("TagInput", () => {
  test("renders tags from value prop", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1", "Tag2"]} onChange={onChange} testID="test" />)

    expect(screen.getByTestId("test-tag-0")).toBeTruthy()
    expect(screen.getByTestId("test-tag-1")).toBeTruthy()
  })

  test("adds a tag when Enter is pressed", () => {
    const onChange = mock(() => {})
    render(<TagInput value={[]} onChange={onChange} testID="test" />)

    const input = screen.getByTestId("test-input")
    fireEvent.change(input, { target: { value: "NewTag" } })
    fireEvent.keyDown(input, { key: "Enter", preventDefault: () => {} })

    expect(onChange).toHaveBeenCalledWith(["NewTag"])
  })

  test("removes a tag when remove button is clicked", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1", "Tag2"]} onChange={onChange} testID="test" />)

    fireEvent.click(screen.getByTestId("test-tag-0-remove"))

    expect(onChange).toHaveBeenCalledWith(["Tag2"])
  })

  test("adds tags when separator is typed", () => {
    const onChange = mock(() => {})
    render(<TagInput value={[]} onChange={onChange} testID="test" />)

    const input = screen.getByTestId("test-input")
    fireEvent.change(input, { target: { value: "Tag1," } })

    // When a separator is typed, the part before it is added as a tag
    // and the part after it remains in the input
    expect(onChange).toHaveBeenCalledWith(["Tag1"])
  })

  test("removes last tag when Backspace is pressed on empty input", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1", "Tag2"]} onChange={onChange} testID="test" />)

    const input = screen.getByTestId("test-input")
    fireEvent.keyDown(input, { key: "Backspace" })

    expect(onChange).toHaveBeenCalledWith(["Tag1"])
  })

  test("adds tag on blur if input has value", () => {
    const onChange = mock(() => {})
    render(<TagInput value={[]} onChange={onChange} testID="test" />)

    const input = screen.getByTestId("test-input")
    fireEvent.change(input, { target: { value: "NewTag" } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(["NewTag"])
  })

  test("does not add duplicate tags", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    const input = screen.getByTestId("test-input")
    fireEvent.change(input, { target: { value: "Tag1" } })
    fireEvent.keyDown(input, { key: "Enter", preventDefault: () => {} })

    expect(onChange).not.toHaveBeenCalled()
  })

  test("shows copy and paste buttons when showCopyPaste is true", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" showCopyPaste />)

    expect(screen.getByTestId("test-copy")).toBeTruthy()
    expect(screen.getByTestId("test-paste")).toBeTruthy()
  })

  test("does not show copy and paste buttons when showCopyPaste is false", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    expect(screen.queryByTestId("test-copy")).toBeNull()
    expect(screen.queryByTestId("test-paste")).toBeNull()
  })

  test("enters edit mode when tag text is clicked", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    fireEvent.click(screen.getByTestId("test-tag-0-text"))

    expect(screen.getByTestId("test-tag-0-edit")).toBeTruthy()
  })

  test("commits edit on Enter key", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    fireEvent.click(screen.getByTestId("test-tag-0-text"))
    const editInput = screen.getByTestId("test-tag-0-edit")
    fireEvent.change(editInput, { target: { value: "EditedTag" } })
    fireEvent.keyDown(editInput, { key: "Enter", preventDefault: () => {} })

    expect(onChange).toHaveBeenCalledWith(["EditedTag"])
  })

  test("commits edit on blur", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    fireEvent.click(screen.getByTestId("test-tag-0-text"))
    const editInput = screen.getByTestId("test-tag-0-edit")
    fireEvent.change(editInput, { target: { value: "EditedTag" } })
    fireEvent.blur(editInput)

    expect(onChange).toHaveBeenCalledWith(["EditedTag"])
  })

  test("cancels edit on Escape key", () => {
    const onChange = mock(() => {})
    render(<TagInput value={["Tag1"]} onChange={onChange} testID="test" />)

    fireEvent.click(screen.getByTestId("test-tag-0-text"))
    const editInput = screen.getByTestId("test-tag-0-edit")
    fireEvent.change(editInput, { target: { value: "EditedTag" } })
    fireEvent.keyDown(editInput, { key: "Escape" })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId("test-tag-0-edit")).toBeNull()
  })
})
