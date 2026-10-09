import { Rating } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import { fn, within, expect, waitFor, fireEvent } from "@storybook/test"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

async function playFiveStarRendersStars({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const canvas = within(canvasElement)
  // findByTestId 系は「1件以上見つかるまで」しか待たないため、星が4個の時点で解決してしまう。
  // 個数が確定するまで待つには waitFor で件数そのものをアサートする。
  await waitFor(() => expect(canvas.queryAllByTestId("rating-star")).toHaveLength(5))
}

async function playSelectableRatingPressesHandler({
  args,
  canvasElement,
}: {
  args: { onPress?: (rating: number) => void; rating?: number | null }
  canvasElement: HTMLElement
}) {
  const canvas = within(canvasElement)
  fireEvent.click(await canvas.findByRole("button"))
  await expect(args.onPress).toHaveBeenCalledWith(args.rating ?? 0)
}

export default {
  title: "Rating",
  component: Rating,
  parameters: {
    notes: "The rating is indicated by stars.",
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
    rating: 10,
  },
  play: playFiveStarRendersStars,
}
export const FourStar: StoryProps = {
  args: {
    rating: 8,
  },
}
export const ThreeStar: StoryProps = {
  args: {
    rating: 6,
  },
}
export const TwoStar: StoryProps = {
  args: {
    rating: 4,
  },
}
export const OneStar: StoryProps = {
  args: {
    rating: 2,
  },
}
export const NoStar: StoryProps = {}

export const SelectableRating: StoryProps = {
  args: {
    variant: "selectable",
    rating: 10,
    onPress: fn(),
  },
  play: playSelectableRatingPressesHandler,
}

export const SelectableNoRating: StoryProps = {
  args: {
    variant: "selectable",
  },
}
export const SelectedRating: StoryProps = {
  args: {
    variant: "selected",
    rating: 4,
  },
}
export const SelectedNoRating: StoryProps = {
  args: {
    variant: "selected",
  },
}
