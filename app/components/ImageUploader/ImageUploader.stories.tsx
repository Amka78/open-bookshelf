import { Meta, StoryObj } from "@storybook/react"
import { ImageUploaderWithState } from "./ImageUploaderWithState"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "ImageUploader",
  component: ImageUploaderWithState,
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
  },
  parameters: {
    notes: `manage image uploads.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof ImageUploaderWithState>

type StoryProps = StoryObj<typeof ImageUploaderWithState>

export const Basic: StoryProps = {}