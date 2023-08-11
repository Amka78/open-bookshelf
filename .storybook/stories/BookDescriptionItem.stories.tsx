import React from "react"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
import { BookDescriptionItem } from "../../app/components"
import { ComponentHolder } from "./ComponentHolder"
import { delay } from "../../app/utils/delay"

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

type ButtonStory = ComponentStoryObj<typeof BookDescriptionItem>

export const Basic: ButtonStory = {
  args: {
    authors: ["SampleAuthor1", "SampleAuthor2"],
    title: "SampleBookTitle",
    source: require("../../assets/images/sample-image-1.png"),
    onPress: async () => {
      await delay(1000)
    },
  },
}
