import { Heading, RootContainer } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { DEFAULT_CONVERT_OPTIONS } from "@/components/BookConvertForm/ConvertOptions"
import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import {
  playBookConvertSelectsOutputFormat,
  playBookConvertShowsAccordionSections,
  playBookConvertShowsErrorState,
  playBookConvertShowsFormatSelection,
  playBookConvertShowsSpinnerWhileConverting,
  playBookConvertShowsSuccessState,
} from "./bookConvertScreenPlay"

// ============================================================
// Storybook用ラッパー: react-hook-form の Context を提供
// ============================================================
type WrapperProps = {
  bookTitle?: string
  inputFormats: string[]
  outputFormats: string[]
  outputFormat?: string
  convertStatus: "idle" | "converting" | "success" | "error"
  errorMessage: string | null
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
        inputFormats={props.inputFormats}
        outputFormats={props.outputFormats}
        control={form.control}
        watch={form.watch}
        convertStatus={props.convertStatus}
        errorMessage={props.errorMessage}
      />
    </RootContainer>
  )
}

export default {
  title: "Screens/BookConvertScreen",
  component: BookConvertStoryWrapper,
  args: {
    bookTitle: "The Great Gatsby",
    inputFormats: ["EPUB", "PDF", "MOBI"],
    outputFormats: ["EPUB", "PDF", "MOBI", "AZW3", "DOCX", "TXT"],
    outputFormat: "",
    convertStatus: "idle" as const,
    errorMessage: null,
  },
  argTypes: {
    convertStatus: {
      control: { type: "select" },
      options: ["idle", "converting", "success", "error"],
    },
  },
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "BookConvert", story: () => <Story /> }} />,
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
    inputFormats: [],
    outputFormats: [],
  },
}

// ============================================================
// play関数付きストーリー
// ============================================================

/**
 * フォーマットボタンを選択する操作の確認。
 */
export const SelectOutputFormat: Story = {
  play: async ({ canvasElement }) => {
    await playBookConvertSelectsOutputFormat({
      canvasElement,
      format: "EPUB",
    })
  },
}

/**
 * outputFormat が未選択でも出力フォーマット選択UIが表示されることを確認。
 */
export const ConvertButtonDisabledWithoutFormat: Story = {
  args: {
    outputFormat: "",
  },
  play: async ({ canvasElement }) => {
    await playBookConvertShowsFormatSelection({
      canvasElement,
      format: "EPUB",
    })
  },
}

/**
 * フォーマット選択ボタンが表示されることを確認。
 */
export const ConvertButtonEnabledWithFormat: Story = {
  args: {
    outputFormat: "PDF",
  },
  play: async ({ canvasElement }) => {
    await playBookConvertShowsFormatSelection({
      canvasElement,
      format: "PDF",
    })
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
    await playBookConvertShowsSpinnerWhileConverting({
      canvasElement,
    })
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
    await playBookConvertShowsSuccessState({
      canvasElement,
    })
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
    await playBookConvertShowsErrorState({
      canvasElement,
    })
  },
}

/**
 * Accordion が表示されていることを確認。
 */
export const AccordionSectionsVisible: Story = {
  play: async ({ canvasElement }) => {
    await playBookConvertShowsAccordionSections({
      canvasElement,
    })
  },
}
