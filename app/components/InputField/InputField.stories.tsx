import { Meta, StoryObj } from "@storybook/react"
import { InputField } from "./InputField"
import { Input } from "@/components"

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
        <Input>
          <Story />
        </Input>
      </ComponentHolder>
    ),
  ],
} as Meta<typeof InputField>

type StoryProps = StoryObj<typeof InputField>

export const Basic: StoryProps = {}