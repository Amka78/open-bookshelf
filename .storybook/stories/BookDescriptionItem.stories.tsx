import { BookDescriptionItem } from "@/components"
import { delay } from "@/utils/delay"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
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
} as ComponentMeta<typeof BookDescriptionItem>

type BookDescriptionItemStory = ComponentStoryObj<typeof BookDescriptionItem>

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
