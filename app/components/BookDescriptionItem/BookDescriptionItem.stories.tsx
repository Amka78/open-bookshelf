import { BookDescriptionItem } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "BookDescriptionItem",
  component: BookDescriptionItem,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    authors: ["SampleAuthor1"],
    title: "SampleBookTitle",
    source: require("../../../assets/images/sample-image-1.png"),
    conjunction: "&",
  },
  argTypes: {
    onPress: { action: "Open ViewerScreen." },
    onLongPress: { action: "Open PreviewScreen." },
    onLinkPress: { action: "Search by link value" },
  },
  parameters: {
    notes: `
    Show the cover of the book along with the book title and author. 
    Click to view the book, long press to view the book details, and press the author to narrow the search by author.
`,
  },
} as Meta<typeof BookDescriptionItem>

type StoryProps = StoryObj<typeof BookDescriptionItem>

export const OneAuthor: StoryProps = {}
export const MultiAuthor: StoryProps = {
  args: {
    authors: ["SampleAuthor1", "SampleAuthor2", "SampleAuthor3"],
  },
}
export const Loading: StoryProps = {
  args: {
    loading: true,
  },
}
