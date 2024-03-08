import { IconButton } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "IconButton",
  component: IconButton,
  args: {
    name: "access-point",
  },
  argTypes: {
    onPress: { action: "Press IconButton." },
  },
  parameters: {
    notes: `Pressable icon`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof IconButton>

type StoryProps = StoryObj<typeof IconButton>

export const Basic: StoryProps = {}
export const NoPressable: StoryProps = {
  pressable: false,
}
