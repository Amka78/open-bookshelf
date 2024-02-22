import { Meta, StoryObj } from "@storybook/react"
import { RatingGroup } from "./RatingGroup"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "RatingGroup",
  component: RatingGroup,
  parameters: {
    notes: `Allows multiple choices of evaluation.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof RatingGroup>

type StoryProps = StoryObj<typeof RatingGroup>

export const Basic: StoryProps = {
  args: {
    max: 10,
    onSelectRating: (rating) => {
      console.log(`Selected rating: ${rating}.`)
    }
  }
}