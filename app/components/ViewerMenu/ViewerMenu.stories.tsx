import { ViewerMenu } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "ViewerMenu",
  component: ViewerMenu,
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

export const Basic: StoryProps = {
  args: {
    pageDirection: "left",
    readingStyle: "singlePage",
  },
  argTypes: {
    onSelectPageDirection: { action: "Change page direction." },
    onSelectReadingStyle: { action: "Change reading style." },
  },
}
