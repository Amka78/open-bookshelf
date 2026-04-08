import { BookDetailFieldList } from "@/components"
import type { Meta, StoryFn, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { bookDetailFieldListStoryArgs } from "../../../.storybook/stories/data/bookDetailFieldListStoryData"

export default {
  title: "BookDetailFieldList",
  component: BookDetailFieldList,
  decorators: [
    (Story: StoryFn) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `
    List FieldMetadata.
`,
  },
} as Meta<typeof BookDetailFieldList>

type StoryProps = StoryObj<typeof BookDetailFieldList>

export const Base: StoryProps = {
  args: bookDetailFieldListStoryArgs,
  argTypes: {
    onFieldPress: { action: "Pressed Link." },
  },
}
