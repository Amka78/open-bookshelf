import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { DateTimePicker } from "./DateTimePicker"

export default {
  title: "DateTimePicker",
  component: DateTimePicker,
  args: {
    value: new Date(),
  },
  argTypes: {
    onChange: { action: "Change DateTime." },
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
