import { Checkbox } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
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
