import type { Category } from "@/models/calibre"
import type { Meta, StoryObj } from "@storybook/react"
import { findByText } from "@testing-library/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { Box } from "@/components"
import { LeftSideMenuContent } from "./LeftSideMenuContent"

const mockTagBrowser = [
  {
    category: "authors",
    name: "Authors",
    count: 3,
    isEditable: true,
    subCategory: [
      { category: "authors", name: "Tolkien, J.R.R.", count: 2, children: [] },
      { category: "authors", name: "Martin, George R.R.", count: 1, children: [] },
    ],
  },
  {
    category: "formats",
    name: "Formats",
    count: 3,
    isEditable: false,
    subCategory: [
      { category: "formats", name: "EPUB", count: 2, children: [] },
      { category: "formats", name: "PDF", count: 1, children: [] },
    ],
  },
] as unknown as Category[]

const noop = async () => {}

/** モバイルの詳細検索画面と同じ「全幅」コンテナで内容を表示する。 */
const FullWidthContent = () => (
  <Box flex={1} width={"$full"}>
    <LeftSideMenuContent tagBrowser={mockTagBrowser} onNodePress={noop} />
  </Box>
)

export default {
  title: "LeftSideMenuContent",
  component: LeftSideMenuContent,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes:
      "タグブラウザの内容のみ（幅・背景・境界線を持たない）。" +
      "サイドバー LeftSideMenu とモバイル画面 LeftSideMenuScreen の両方がこれを参照する。",
  },
} as Meta<typeof LeftSideMenuContent>

type StoryProps = StoryObj<typeof LeftSideMenuContent>

export const FullWidth: StoryProps = {
  render: () => <FullWidthContent />,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
}

export const CategoriesVisible: StoryProps = {
  render: () => <FullWidthContent />,
  play: async ({ canvasElement }) => {
    // 容器が変わっても内容（カテゴリ一覧）が描画されることを確認する。
    await findByText(canvasElement, "Authors")
    await findByText(canvasElement, "Formats")
  },
}
