import { BookDetailMenu } from "@/components"
import { Meta, StoryObj } from "@storybook/react"

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
    onConvertBook: { action: "convert book."},
    onDeleteBook: { action: "delete book."},
    onDownloadBook: { action: "download book."},
    onOpenBook: { action: "open book."},
    onShowEdit: { action: "show eidt"},
  },
  parameters: {
    notes: `
    Generate a field corresponding to the DataType in the FieldMetadata.
`,
  },
} as Meta<typeof BookDetailMenu>

type StoryProps = StoryObj<typeof BookDetailMenu>

export const Basic: StoryProps = {}
