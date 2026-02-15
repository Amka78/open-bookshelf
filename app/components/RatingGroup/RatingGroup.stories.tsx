import type { Meta, StoryObj } from "@storybook/react"
import { RatingGroup } from "./RatingGroup"
import { logger } from "@/utils/logger"

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
    selectedValue: 8,
    onSelectRating: (rating) => {
      logger.debug("Selected rating", rating)
    },
  },
}
