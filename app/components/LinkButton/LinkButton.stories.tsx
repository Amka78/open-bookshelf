import { Meta, StoryObj } from "@storybook/react"
import { LinkButton } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Link Button",
  component: LinkButton,
  parameters: {
    notes: `Search for books by the link you press.`,
  },
  args: {
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof LinkButton>

type StoryProps = StoryObj<typeof LinkButton>

export const Basic: StoryProps = {
  args: {
    conjunction: "&",
    links: { value: "test1" },
  }
}
export const LinkWithLabel: StoryProps = {
  args: {
    conjunction: "&",
    links: [
      { value: "Link1", label: "LabelName1" },
      { value: "Link2", label: "LabelName2" },
    ]
  }
}
export const MultipleLink: StoryProps = {
  args: {
    conjunction: "&",
    links: [
      { value: "Link1" },
      { value: "Link2" },
      { value: "Link3" },
    ]
  }
} 