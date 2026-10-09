import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { withComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { DateTimePicker } from "./DateTimePicker"

export default {
  title: "DateTimePicker",
  component: DateTimePicker,
  args: {
    // native は parseISO、web は value.split("T")[0] を呼ぶため ISO 文字列が契約。
    value: "2024-06-15T00:00:00.000Z",
  },
  argTypes: {
    onChange: { action: "Change DateTime." },
  },
  decorators: [withComponentHolder],
} as Meta<typeof DateTimePicker>

type CheckboxStory = StoryObj<typeof DateTimePicker>

export const Basic: CheckboxStory = {}
