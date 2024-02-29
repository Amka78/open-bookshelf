import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { FormTestContainer } from "./FormTestContainer"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "FormTestContainer",
  component: FormTestContainer,
  argTypes: {
    onPressCheckForm: { action: "Press check form." }
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `Container for React Hook Form contorl test.`
  }
} as Meta<typeof FormTestContainer>

type HeadingStory = StoryObj<typeof FormTestContainer>

export const Basic: HeadingStory = {}