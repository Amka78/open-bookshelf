import { LibraryViewButton } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "LibraryViewButton",
  component: LibraryViewButton,
  parameters: {
    notes: `Toggles the View display method.`,
  },
  args: {
    mode: "gridView",
  },
  argTypes: {
    onPress: { action: "Press LibraryViewButton." },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof LibraryViewButton>

type StoryProps = StoryObj<typeof LibraryViewButton>

export const GridView: StoryProps = {}
export const ViewList: StoryProps = {
  args: {
    mode: "viewList",
  },
}
