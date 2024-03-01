import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { DateTimePicker } from "./DateTimePicker"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "DateTimePicker",
  component: DateTimePicker,
  args: {
    value: new Date()
  },
  argTypes: {
    onChange: { action: "Change DateTime." }
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof DateTimePicker>

type CheckboxStory = StoryObj<typeof DateTimePicker>

export const Basic: CheckboxStory = {}
