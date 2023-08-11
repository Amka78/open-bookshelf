import React from "react"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
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
} as ComponentMeta<typeof Heading>

type HeadingStory = ComponentStoryObj<typeof Heading>

export const Basic: HeadingStory = {
  args: {
    tx: "connectScreen.welcome",
  },
}
