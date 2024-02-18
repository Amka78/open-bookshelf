import { BookImageItem } from "@/components"
import { delay } from "@/utils/delay"
import { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ComponentHolder } from "./ComponentHolder"

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
} as Meta<typeof BookImageItem>

type BookImageItemStory = StoryObj<typeof BookImageItem>

export const Basic: BookImageItemStory = {
  args: {
    source: require("../../assets/images/sample-image-1.png"),
    onPress: async () => {
      await delay(1000)
    },
  },
}
