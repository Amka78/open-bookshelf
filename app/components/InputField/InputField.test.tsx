import { describe as baseDescribe, test as baseTest, beforeAll, beforeEach, expect, jest, mock } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

let platformOS: "ios" | "web" = "ios"

mock.module("react-native", () => ({
  Platform: {
    get OS() {
      return platformOS
    },
  },
}))

mock.module("@/i18n", () => ({
  translate: (key: string) =>
    key === "connectScreen.placeHolder" ? "(http or https)://{Address}:{Port}" : key,
}))

mock.module("@gluestack-ui/themed", () => ({
  InputField: ({
    testID,
    placeholder,
    onChange,
    onChangeText,
    ...props
  }: Record<string, unknown> & {
    testID?: string
    placeholder?: string
    onChange?: (event: { nativeEvent: { text: string }; target: HTMLInputElement }) => void
    onChangeText?: (text: string) => void
  }) => (
    <input
      data-testid={testID ?? "input-field"}
      placeholder={placeholder}
      onChange={(event) => {
        if (platformOS === "web") {
          onChange?.({
            nativeEvent: { text: event.target.value },
            target: event.target,
          })
          return
        }

        onChangeText?.(event.target.value)
      }}
      {...(props as object)}
    />
  ),
}))

let InputField: typeof import("./InputField").InputField

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("InputField", () => {
  beforeAll(async () => {
    ;({ InputField } = await import("./InputField"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    platformOS = "ios"
  })

  test("forwards onChangeText on native platforms", () => {
    const onChangeText = jest.fn()

    render(
      <InputField
        testID="input-field"
        placeholderTx="connectScreen.placeHolder"
        onChangeText={onChangeText}
      />,
    )

    fireEvent.change(screen.getByTestId("input-field"), {
      target: { value: "https://books.example.com" },
    })

    expect(onChangeText).toHaveBeenCalledWith("https://books.example.com")
    expect(screen.getByPlaceholderText("(http or https)://{Address}:{Port}")).not.toBeNull()
  })

  test("keeps the web change bridge to both onChange and onChangeText", () => {
    platformOS = "web"
    const onChangeText = jest.fn()
    const onChange = jest.fn()

    render(<InputField testID="input-field" onChange={onChange} onChangeText={onChangeText} />)

    fireEvent.change(screen.getByTestId("input-field"), {
      target: { value: "http://localhost:8080" },
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenCalledWith("http://localhost:8080")
  })
})
