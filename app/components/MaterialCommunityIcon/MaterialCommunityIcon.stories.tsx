import { MaterialCommunityIcon } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "MaterialCommunityIcon",
  component: MaterialCommunityIcon,
  parameters: {
    notes: `OpenBookShelf's common icons`,
  },
  args: {
    name: "newspaper",
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof MaterialCommunityIcon>

type StoryProps = StoryObj<typeof MaterialCommunityIcon>

export const Basic: StoryProps = {}
export const SizeMdMinus: StoryProps = {
  args: {
    iconSize: "md-",
  },
}
export const SizeSM: StoryProps = {
  args: {
    iconSize: "sm",
  },
}
export const SizeSMMinus: StoryProps = {
  args: {
    iconSize: "sm-",
  },
}
export const VariantStaggerChild: StoryProps = {
  args: {
    variant: "staggerChild",
  },
}
export const VariantStaggerRoot: StoryProps = {
  args: {
    variant: "staggerRoot",
  },
}
export const Rotate90: StoryProps = {
  args: {
    rotate: "90",
  },
}
export const Rotate180: StoryProps = {
  args: {
    rotate: "180",
  },
}
export const Rotate270: StoryProps = {
  args: {
    rotate: "270",
  },
}
