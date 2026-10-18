import { act, fireEvent } from "@testing-library/react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, waitFor } from "@storybook/test"
import { BookDetailMenu } from "./BookDetailMenu"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

function findByTestId(canvasElement: HTMLElement, testId: string): HTMLElement {
  const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null

  if (!found) {
    throw new Error(`Element with data-testid='${testId}' was not found.`)
  }

  return found
}

function hasTestId(canvasElement: HTMLElement, testId: string): boolean {
  return canvasElement.querySelector(`[data-testid="${testId}"]`) !== null
}

async function playBookDetailMenuEditDoesNotBubble({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await act(async () => {
    fireEvent.click(findByTestId(canvasElement, "book-detail-edit-button"))
  })
}

async function playBookDetailMenuOcrDoesNotBubble({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await act(async () => {
    fireEvent.click(findByTestId(canvasElement, "book-detail-ocr-button"))
  })
}

// 「詳細を表示」ボタンは onOpenBookDetail を渡したときだけ描画される。
// 必ず描画される open ボタンを起点に待つことで、メニュー未描画による空振り検証を防ぐ。
async function playDetailInfoButtonIsHidden({ canvasElement }: { canvasElement: HTMLElement }) {
  await waitFor(() => expect(hasTestId(canvasElement, "book-detail-open-button")).toBe(true))
  expect(hasTestId(canvasElement, "book-detail-info-button")).toBe(false)
}

async function playDetailInfoButtonIsShown({ canvasElement }: { canvasElement: HTMLElement }) {
  await waitFor(() => expect(hasTestId(canvasElement, "book-detail-info-button")).toBe(true))
}

export default {
  title: "BookDetailMenu",
  component: BookDetailMenu,
  // argTypes の action はコントロール設定にすぎず prop 値を供給しない。
  // undefined の prop を wrapMenuAction が受け取るとエラーになるため、必要な spy を渡す。
  args: {
    onRunCoverOcr: fn(),
    onEditBook: fn(),
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  argTypes: {
    onConvertBook: { action: "convert book." },
    onDeleteBook: { action: "delete book." },
    onDownloadBook: { action: "download book." },
    onOpenBook: { action: "open book." },
    onEditBook: { action: "show eidt" },
    onRunCoverOcr: { action: "run cover ocr" },
  },
  parameters: {
    notes: `
    Generate a field corresponding to the DataType in the FieldMetadata.
`,
  },
} as Meta<typeof BookDetailMenu>

type StoryProps = StoryObj<typeof BookDetailMenu>

export const Basic: StoryProps = {}

export const EditDoesNotBubble: StoryProps = {
  play: playBookDetailMenuEditDoesNotBubble,
}

export const OcrDoesNotBubble: StoryProps = {
  play: playBookDetailMenuOcrDoesNotBubble,
}

// リスト／グリッド側：詳細画面へ遷移できるのでボタンが出る。
export const InfoButtonShownOnList: StoryProps = {
  args: {
    onOpenBookDetail: fn(),
  },
  play: playDetailInfoButtonIsShown,
}

// 詳細画面・詳細モーダル側：既に詳細なので遷移ボタンを出さない。
export const InfoButtonHiddenWithoutDetailHandler: StoryProps = {
  play: playDetailInfoButtonIsHidden,
}
