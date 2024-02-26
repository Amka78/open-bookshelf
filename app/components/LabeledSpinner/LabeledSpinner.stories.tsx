import { Meta, StoryObj } from "@storybook/react"
import { LabeledSpinner } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "LabeledSpinner",
  component: LabeledSpinner,
  parameters: {
    notes: `Spinner with label.`,
  },
  args: {
    labelTx: "bookImage.loading",
    labelDirection: "vertical"
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof LabeledSpinner>

type StoryProps = StoryObj<typeof LabeledSpinner>

export const VerticalLoading: StoryProps = {}
export const LinkWithLabel: StoryProps = {
  args: {
    labelDirection: "horizontal"
  }
}
export const NoTranslationLabel: StoryProps = {
  args: {
    label: "Now Loading..."
  }
} 