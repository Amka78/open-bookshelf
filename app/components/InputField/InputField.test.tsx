import { fireEvent, render, screen } from "@testing-library/react"
import { describe as baseDescribe, test as baseTest, beforeEach, expect, vi } from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

let platformOS: "ios" | "web" = "ios"

function applyInputFieldMocks() {
  // Platform だけの最小 mock にすると、vi.resetModules() 後に setup の包括 mock が追い出され、
  // 実 @/i18n が評価される際に I18nManager.allowRTL で落ちる。必要な global を含めて自己完結させる。
  vi.doMock("react-native", () => ({
    Platform: {
      get OS() {
        return platformOS
      },
    },
    I18nManager: {
      allowRTL: vi.fn(),
      forceRTL: vi.fn(),
      swapLeftAndRight: vi.fn(),
      isRTL: false,
    },
  }))

  vi.doMock("@/i18n", () => ({
    translate: (key: string) =>
      key === "connectScreen.placeHolder" ? "(http or https)://{Address}:{Port}" : key,
  }))

  vi.doMock("./template", () => ({
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

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

// bun 版は `?test=<nonce>` で import をキャッシュバスティングしていたが、
// Vitest は vi.resetModules() でレジストリをクリアすれば再評価される。
async function loadInputField() {
  vi.resetModules()
  applyInputFieldMocks()
  const imported = await import("./InputField.tsx")
  return imported.InputField
}

describe("InputField", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    platformOS = "ios"
  })

  test("forwards onChangeText on native platforms", async () => {
    const InputField = await loadInputField()
    const onChangeText = vi.fn()

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
    const onChangeText = vi.fn()
    const onChange = vi.fn()

    render(<InputField testID="input-field" onChange={onChange} onChangeText={onChangeText} />)

    fireEvent.change(screen.getByTestId("input-field"), {
      target: { value: "http://localhost:8080" },
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenCalledWith("http://localhost:8080")
  })
})
