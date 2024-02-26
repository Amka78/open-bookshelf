import { Meta, StoryObj } from "@storybook/react"
import { InputField } from "./InputField"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "InputField",
  component: InputField,
  parameters: {
    notes: `InputField`,
  },
  args: {
    placeholderTx: "connectScreen.placeHolder"
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof InputField>

type StoryProps = StoryObj<typeof InputField>

export const Basic: StoryProps = {}