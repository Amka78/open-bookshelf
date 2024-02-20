import { Meta, StoryObj } from "@storybook/react"
import { Box, HStack } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "HStack",
  component: HStack,
  parameters: {
    notes: `Place component horizontally`,
  },
} as Meta<typeof HStack>

type StoryProps = StoryObj<typeof HStack>

export const Basic: StoryProps = {
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story/>
      </ComponentHolder>
    ),
  ],
  args: {
    children:  (<>
          <Box width={"$32"} height={"$32"} backgroundColor="blue"/>
          <Box width={"$32"} height={"$32"} backgroundColor="red"/>
          <Box width={"$32"} height={"$32"} backgroundColor="green"/></>)
  }
}
