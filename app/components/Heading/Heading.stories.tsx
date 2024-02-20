import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { Heading } from "@/components"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Heading",
  component: Heading,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `String display for text highlighting.`
  }
} as Meta<typeof Heading>

type HeadingStory = StoryObj<typeof Heading>

export const SupportMultiLingual: HeadingStory = {
  args: {
    tx: "connectScreen.welcome",
  },
}
export const DirectInput: HeadingStory = {
  args: {
    children: "Direct Text Input."
  },
}
