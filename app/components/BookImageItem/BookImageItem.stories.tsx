import { BookImageItem } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "BookImageItem",
  component: BookImageItem,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
  },
} as Meta<typeof BookImageItem>

type BookImageItemStory = StoryObj<typeof BookImageItem>

export const Pressable: BookImageItemStory = {
  argTypes: {
    onPress: { action: "open book." },
    onLongPress: { action: "open detail screen." },
  },
}

export const JustImage: BookImageItemStory = {}
export const Loading: BookImageItemStory = {
  args: {
    loading: true,
  },
}
