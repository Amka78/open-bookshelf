import { Box, VStack } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "VStack",
  component: VStack,
  parameters: {
    notes: `Place component vertically`,
  },
} as Meta<typeof VStack>

type StoryProps = StoryObj<typeof VStack>

export const Basic: StoryProps = {
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    children: (
      <>
        <Box width={"$32"} height={"$32"} backgroundColor="blue" />
        <Box width={"$32"} height={"$32"} backgroundColor="red" />
        <Box width={"$32"} height={"$32"} backgroundColor="green" />
      </>
    ),
  },
}
