import { Meta, StoryObj } from "@storybook/react"
import { Box, ScrollView } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "ScrollView",
  component: ScrollView,
  parameters: {
    notes: `Place Component in scrollable format.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof ScrollView>

type StoryProps = StoryObj<typeof ScrollView>

export const Basic: StoryProps = {
  args: {
    children: (<>
      <Box width={"$32"} height={"$32"} backgroundColor="blue" />
      <Box width={"$32"} height={"$32"} backgroundColor="red" />
      <Box width={"$32"} height={"$32"} backgroundColor="green" /></>)
  }
}
