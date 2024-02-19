import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Button",
  component: Button,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof Button>

type ButtonStory = StoryObj<typeof Button>

export const Basic: ButtonStory = {
  args: {
    tx: "connectScreen.connect",
  },
  argTypes: {
    onPress: { action: "pressed the button" },
  },
}
