import { Meta, StoryObj } from "@storybook/react"
import { Text } from "@/components"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Text",
  component: Text,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `standard string representation.`
  }
} as Meta<typeof Text>

type Story = StoryObj<typeof Text>

export const SupportMultiLingual: Story = {
  args: {
    tx: "connectScreen.welcome",
  },
}
export const DirectInput: Story = {
  args: {
    children: "Direct Text Input."
  },
}
