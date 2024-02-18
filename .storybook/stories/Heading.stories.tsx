import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { Heading } from "@/components"
import { ComponentHolder } from "./ComponentHolder"

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
} as Meta<typeof Heading>

type HeadingStory = StoryObj<typeof Heading>

export const Basic: HeadingStory = {
  args: {
    tx: "connectScreen.welcome",
  },
}
