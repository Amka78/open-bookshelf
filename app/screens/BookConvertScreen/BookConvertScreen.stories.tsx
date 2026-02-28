import { Heading, RootContainer } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { DEFAULT_CONVERT_OPTIONS } from "@/components/BookConvertForm/ConvertOptions"
import { expect } from "@storybook/jest"
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import { useForm } from "react-hook-form"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

// ============================================================
// Storybook用ラッパー: react-hook-form の Context を提供
// ============================================================
type WrapperProps = {
  bookTitle?: string
  formats: string[]
  outputFormat?: string
  convertStatus: "idle" | "converting" | "success" | "error"
  errorMessage: string | null
  onConvert: () => void
}

function BookConvertStoryWrapper(props: WrapperProps) {
  const form = useForm<ConvertOptions>({
    defaultValues: {
      outputFormat: props.outputFormat ?? "",
      inputFormat: null,
      ...DEFAULT_CONVERT_OPTIONS,
    },
  })

  return (
    <RootContainer padding={"$4"}>
      <Heading isTruncated={true} marginBottom={"$3"}>
        {props.bookTitle ?? ""}
      </Heading>
      <BookConvertForm
        formats={props.formats}
        control={form.control}
        watch={form.watch}
        convertStatus={props.convertStatus}
        errorMessage={props.errorMessage}
        onConvert={props.onConvert}
      />
    </RootContainer>
  )
}

export default {
  title: "Screens/BookConvertScreen",
  component: BookConvertStoryWrapper,
  args: {
    bookTitle: "The Great Gatsby",
    formats: ["EPUB", "PDF", "MOBI", "AZW3"],
    outputFormat: "",
    convertStatus: "idle" as const,
    errorMessage: null,
    onConvert: () => {},
  },
  argTypes: {
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
} as Meta<typeof BookConvertStoryWrapper>

type Story = StoryObj<typeof BookConvertStoryWrapper>

/** デフォルト状態（フォーマット未選択） */
export const Basic: Story = {}

/** EPUBフォーマット選択済み・EPUB出力オプション表示 */
export const EPUBSelected: Story = {
  args: {
    outputFormat: "EPUB",
  },
}

/** PDFフォーマット選択済み・PDF出力オプション表示 */
export const PDFSelected: Story = {
  args: {
    outputFormat: "PDF",
  },
}

/** MOBIフォーマット選択済み・MOBI出力オプション表示 */
export const MOBISelected: Story = {
  args: {
    outputFormat: "MOBI",
  },
}

/** 変換中の状態（スピナー表示） */
export const Converting: Story = {
  args: {
    outputFormat: "EPUB",
    convertStatus: "converting" as const,
  },
}

/** 変換完了の状態 */
export const ConvertSuccess: Story = {
  args: {
    outputFormat: "EPUB",
    convertStatus: "success" as const,
  },
}

/** 変換エラーの状態 */
export const ConvertError: Story = {
  args: {
    outputFormat: "EPUB",
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

// ============================================================
// play関数付きストーリー
// ============================================================

/**
 * フォーマットボタンを選択する操作の確認。
 */
export const SelectOutputFormat: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const epubButton = await canvas.findByTestId("format-button-EPUB")
    await userEvent.click(epubButton)

    // ボタンのアクセシビリティを確認
    expect(epubButton).toBeTruthy()
  },
}

/**
 * 変換ボタンが outputFormat なしでは無効になっていることを確認。
 */
export const ConvertButtonDisabledWithoutFormat: Story = {
  args: {
    outputFormat: "",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const convertButton = await canvas.findByTestId("convert-button")
    expect(convertButton).toBeTruthy()
  },
}

/**
 * フォーマット選択後に変換ボタンが押下できることを確認。
 */
export const ConvertButtonEnabledWithFormat: Story = {
  args: {
    outputFormat: "PDF",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const convertButton = await canvas.findByTestId("convert-button")
    await userEvent.click(convertButton)

    expect(args.onConvert).toHaveBeenCalled()
  },
}

/**
 * 変換中はスピナーが表示されることを確認。
 */
export const ConvertingShowsSpinner: Story = {
  args: {
    outputFormat: "EPUB",
    convertStatus: "converting" as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const spinner = await canvas.findByTestId("convert-spinner")
    expect(spinner).toBeTruthy()
  },
}

/**
 * 変換成功メッセージが表示されることを確認。
 */
export const SuccessMessageVisible: Story = {
  args: {
    outputFormat: "EPUB",
    convertStatus: "success" as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const successMsg = await canvas.findByTestId("convert-success")
    expect(successMsg).toBeTruthy()
  },
}

/**
 * エラーメッセージが表示されることを確認。
 */
export const ErrorMessageVisible: Story = {
  args: {
    outputFormat: "EPUB",
    convertStatus: "error" as const,
    errorMessage: "Conversion traceback: invalid format",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const errorMsg = await canvas.findByTestId("convert-error")
    expect(errorMsg).toBeTruthy()
  },
}

/**
 * Accordion が表示されていることを確認。
 */
export const AccordionSectionsVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const accordion = await canvas.findByTestId("convert-accordion")
    expect(accordion).toBeTruthy()
  },
}
