import { describe as baseDescribe, test as baseTest, beforeEach, expect, jest, mock } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

let platformOS: "ios" | "web" = "ios"

function applyInputFieldMocks() {
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

  mock.module("./template", () => ({
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
}

applyInputFieldMocks()

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)
let inputFieldImportNonce = 0

async function loadInputField() {
  applyInputFieldMocks()
  inputFieldImportNonce += 1
  const imported = await import(`./InputField.tsx?test=${inputFieldImportNonce}`)
  return imported.InputField
}

describe("InputField", () => {
  beforeEach(() => {
    applyInputFieldMocks()
    jest.clearAllMocks()
    platformOS = "ios"
  })

  test("forwards onChangeText on native platforms", async () => {
    const InputField = await loadInputField()
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

  test("keeps the web change bridge to both onChange and onChangeText", async () => {
    const InputField = await loadInputField()
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
