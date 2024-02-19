import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "@/components"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

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
} as Meta<typeof Checkbox>

type CheckboxStory = StoryObj<typeof Checkbox>

export const Basic: CheckboxStory = {
  args: {
    tx: "connectScreen.checkbox",
  },
}
