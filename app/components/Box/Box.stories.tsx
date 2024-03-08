import { Box, VStack } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Box",
  component: Box,
  args: {
    height: "$32",
    width: "$32",
    backgroundColor: "red",
  },
  parameters: {
    notes: `Standard container`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof Box>

type StoryProps = StoryObj<typeof Box>

export const Basic: StoryProps = {}
