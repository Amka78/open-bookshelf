import { Box, RootContainer, Text } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "RootContainer",
  component: RootContainer,
  parameters: {
    notes: `Convergence-enabled screen containers.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof RootContainer>

type StoryProps = StoryObj<typeof RootContainer>

export const Basic: StoryProps = {
  args: {
    children: (
      <Box flex={1} backgroundColor="blue">
        <Text>{"RootContainer Test"}</Text>
      </Box>
    ),
  },
}
