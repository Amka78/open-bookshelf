import { Meta, StoryObj } from "@storybook/react"
import { Input } from "./Input"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Input",
  component: Input,
  parameters: {
    notes: `Input`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof Input>

type StoryProps = StoryObj<typeof Input>

export const Basic: StoryProps = {}