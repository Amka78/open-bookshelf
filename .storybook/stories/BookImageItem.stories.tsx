import { BookImageItem } from "@/components"
import { delay } from "@/utils/delay"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
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
} as ComponentMeta<typeof BookImageItem>

type ButtonStory = ComponentStoryObj<typeof BookImageItem>

export const Basic: ButtonStory = {
  args: {
    source: require("../../assets/images/sample-image-1.png"),
    onPress: async () => {
      await delay(1000)
    },
  },
}
