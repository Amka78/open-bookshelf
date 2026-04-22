import { BookDetailMenu } from "./BookDetailMenu"
import type { Meta, StoryObj } from "@storybook/react"
import {
  playBookDetailMenuEditDoesNotBubble,
  playBookDetailMenuOcrDoesNotBubble,
} from "./bookDetailMenuStoryPlay"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "BookDetailMenu",
  component: BookDetailMenu,
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
