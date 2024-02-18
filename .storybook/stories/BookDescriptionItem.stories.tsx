import { BookDescriptionItem } from "@/components"
import { delay } from "@/utils/delay"
import { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ComponentHolder } from "./ComponentHolder"

export default {
  title: "BookDescriptionItem",
  component: BookDescriptionItem,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof BookDescriptionItem>

type BookDescriptionItemStory = StoryObj<typeof BookDescriptionItem>

export const Basic: BookDescriptionItemStory = {
  args: {
    authors: ["SampleAuthor1", "SampleAuthor2"],
    title: "SampleBookTitle",
    source: require("../../assets/images/sample-image-1.png"),
    onPress: async () => {
      await delay(1000)
    },
  },
}
