import React from "react"
import { Meta, StoryObj } from "@storybook/react"
import { AddFileButton } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "AddFileButton",
  component: AddFileButton,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof AddFileButton>

type ButtonStory = StoryObj<typeof AddFileButton>

export const Basic: ButtonStory = {}
