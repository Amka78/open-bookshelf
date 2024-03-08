import { ViewerHeader } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { Basic as ViewerMenuBasic } from "../ViewerMenu/ViewerMenu.stories"

export default {
  title: "ViewerHeader",
  component: ViewerHeader,
  args: {
    ...ViewerMenuBasic.args,
    title: "HeaderTitle",
    visible: true,
  },
  argTypes: {
    ...ViewerMenuBasic.argTypes,
    onLeftArrowPress: { action: "Pressed Left Arrow." },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `Viewer display settings in header`,
  },
} as Meta<typeof ViewerHeader>

type StoryProps = StoryObj<typeof ViewerHeader>

export const Basic: StoryProps = {}
export const LongTitle: StoryProps = {
  args: {
    title: "HeaderTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  },
}
export const Hide: StoryProps = {
  args: {
    visible: false,
  },
}
