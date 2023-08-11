import React from "react"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
import { Checkbox } from "@/components"
import { ComponentHolder } from "./ComponentHolder"

export default {
  title: "Checkbox",
  component: Checkbox,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as ComponentMeta<typeof Checkbox>

type CheckboxStory = ComponentStoryObj<typeof Checkbox>

export const Basic: CheckboxStory = {
  args: {
    tx: "connectScreen.checkbox",
  },
}
