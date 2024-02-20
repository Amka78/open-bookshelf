import { Meta, StoryObj } from "@storybook/react"
import { ViewerMenu } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "ViewerMenu",
  component: ViewerMenu,
  args: {
    pageDirection: "left",
    readingStyle: "singlePage",
  },
  argTypes: {
    onSelectPageDirection: { action: "Change page direction."},
    onSelectReadingStyle: { action: "Change reading style."}
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `Viewer display settings.`,
  },
} as Meta<typeof ViewerMenu>

type StoryProps = StoryObj<typeof ViewerMenu>

export const Basic: StoryProps = {}