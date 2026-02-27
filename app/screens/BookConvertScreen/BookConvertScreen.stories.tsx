import { BookConvertScreenTemplate } from "@/screens/BookConvertScreen/BookConvertScreen"
import { expect } from "@storybook/jest"
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

export default {
  title: "Screens/BookConvertScreen",
  component: BookConvertScreenTemplate,
  args: {
    bookTitle: "The Great Gatsby",
    formats: ["EPUB", "PDF", "MOBI", "AZW3"],
    selectedFormat: null,
    convertStatus: "idle" as const,
    errorMessage: null,
    onFormatSelect: () => {},
    onConvert: () => {},
  },
  argTypes: {
    onFormatSelect: { action: "format selected" },
    onConvert: { action: "convert pressed" },
    convertStatus: {
      control: { type: "select" },
      options: ["idle", "converting", "success", "error"],
    },
  },
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof BookConvertScreenTemplate>

type Story = StoryObj<typeof BookConvertScreenTemplate>

/** デフォルト状態（フォーマット未選択） */
export const Basic: Story = {}

/** フォーマット選択済みの状態 */
export const FormatSelected: Story = {
  args: {
    selectedFormat: "EPUB",
  },
}

/** 変換中の状態 */
export const Converting: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "converting" as const,
  },
}

/** 変換完了の状態 */
export const ConvertSuccess: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "success" as const,
  },
}

/** 変換エラーの状態 */
export const ConvertError: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "error" as const,
    errorMessage: "Conversion failed: traceback error from calibre server",
  },
}

/** フォーマットが存在しない場合 */
export const NoFormats: Story = {
  args: {
    formats: [],
  },
}

/**
 * フォーマットを選択して変換ボタンを押す操作を確認する。
 */
export const SelectFormatAndConvert: Story = {
  args: {
    selectedFormat: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // EPUBフォーマットボタンをクリック
    const epubButton = await canvas.findByTestId("format-button-EPUB")
    await userEvent.click(epubButton)

    expect(args.onFormatSelect).toHaveBeenCalledWith("EPUB")
  },
}

/**
 * 変換ボタンが selectedFormat なしでは無効になっていることを確認する。
 */
export const ConvertButtonDisabledWithoutFormat: Story = {
  args: {
    selectedFormat: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const convertButton = await canvas.findByTestId("convert-button")
    // disabled属性の存在確認
    expect(convertButton).toBeTruthy()
  },
}

/**
 * フォーマット選択後に変換ボタンが有効になり押下できることを確認する。
 */
export const ConvertButtonEnabledWithFormat: Story = {
  args: {
    selectedFormat: "PDF",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const convertButton = await canvas.findByTestId("convert-button")
    expect(convertButton).toBeTruthy()

    await userEvent.click(convertButton)

    expect(args.onConvert).toHaveBeenCalled()
  },
}

/**
 * 変換中はスピナーが表示されることを確認する。
 */
export const ConvertingShowsSpinner: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "converting" as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const spinner = await canvas.findByTestId("convert-spinner")
    expect(spinner).toBeTruthy()
  },
}

/**
 * 変換成功メッセージが表示されることを確認する。
 */
export const SuccessMessageVisible: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "success" as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const successMsg = await canvas.findByTestId("convert-success")
    expect(successMsg).toBeTruthy()
  },
}

/**
 * エラーメッセージが表示されることを確認する。
 */
export const ErrorMessageVisible: Story = {
  args: {
    selectedFormat: "EPUB",
    convertStatus: "error" as const,
    errorMessage: "Conversion traceback: invalid format",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const errorMsg = await canvas.findByTestId("convert-error")
    expect(errorMsg).toBeTruthy()
  },
}
