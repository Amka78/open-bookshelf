import { Meta, StoryObj } from "@storybook/react"
import { SortMenu } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "SortMenu",
  component: SortMenu,
  args: {
    field: [
      { id: "001", name: "Sort1" },
      { id: "002", name: "Sort2" },
      { id: "003", name: "Sort3" }
    ],
    selectedSort: "001",
    selectedSortOrder: "asc",
  },
  parameters: {
    notes: `Enumerate sorting information.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder alignItems="center" justifyContent="center" >
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof SortMenu>

type StoryProps = StoryObj<typeof SortMenu>

export const Basic: StoryProps = {}
