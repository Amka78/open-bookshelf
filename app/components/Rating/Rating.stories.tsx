import { Meta, StoryObj } from "@storybook/react"
import { Rating } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Rating",
  component: Rating,
  parameters: {
    notes: `The rating is indicated by stars.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof Rating>

type StoryProps = StoryObj<typeof Rating>

export const FiveStar: StoryProps = {
  args: {
    rating: 10
  }
}
export const FourStar: StoryProps = {
  args: {
    rating: 8
  }
}
export const ThreeStar: StoryProps = {
  args: {
    rating: 6
  }
}
export const TwoStar: StoryProps = {
  args: {
    rating: 4
  }
}
export const OneStar: StoryProps = {
  args: {
    rating: 2
  }
}
export const NoStar: StoryProps = {}

export const SelectableRating: StoryProps = {
  args: {
    variant: "selectable",
    rating: 10
  }
}

export const SelectableNoRating: StoryProps = {
  args: {
    variant: "selectable",
  }
}
export const SelectedRating: StoryProps = {
  args: {
    variant: "selected",
    rating: 4
  }
}
export const SelectedNoRating: StoryProps = {
  args: {
    variant: "selected"

  }
}