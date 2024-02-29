import { Meta, StoryObj } from "@storybook/react"
import { Image } from "./Image"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Image",
  component: Image,
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    style: { width: 200, height: 300 }
  },
  parameters: {
    notes: `Image Core Component`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof Image>

type StoryProps = StoryObj<typeof Image>

export const Basic: StoryProps = {}