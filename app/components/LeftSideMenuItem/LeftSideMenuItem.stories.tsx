import { LeftSideMenuItem } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "LeftSideMenuItem",
  component: LeftSideMenuItem,
  parameters: {
    notes: `Draw each item on the left menu.`,
  },
  args: {
    count: 10,
    mode: "category",
    name: "LeftSideMenu1",
    selected: true,
  },
  argTypes: {
    onLastNodePress: { action: "Press last node." },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof LeftSideMenuItem>

type StoryProps = StoryObj<typeof LeftSideMenuItem>

export const Category: StoryProps = {
  args: {
    children: (
      <LeftSideMenuItem
        mode={"subCategory"}
        name="SubCategory"
        count={1}
        children={[<LeftSideMenuItem mode={"node"} name="Node" count={20} />]}
      />
    ),
  },
}
export const SubCategory: StoryProps = {
  args: {
    mode: "subCategory",
  },
}
