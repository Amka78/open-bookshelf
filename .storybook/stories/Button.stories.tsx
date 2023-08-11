import React from "react"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
import { Button } from "@/components"
import { ComponentHolder } from "./ComponentHolder"

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
} as ComponentMeta<typeof Button>

type ButtonStory = ComponentStoryObj<typeof Button>

export const Basic: ButtonStory = {
  args: {
    tx: "connectScreen.connect",
  },
  argTypes: {
    onPress: { action: "pressed the button" },
  },
}
