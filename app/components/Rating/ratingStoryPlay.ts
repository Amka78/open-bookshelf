import { expect, fireEvent, within } from "@storybook/test"

export async function playFiveStarRendersStars({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const canvas = within(canvasElement)
  const stars = canvas.getAllByTestId("rating-star")
  await expect(stars).toHaveLength(5)
}

export async function playSelectableRatingPressesHandler({
  args,
  canvasElement,
}: {
  args: { onPress?: (rating: number) => void; rating?: number | null }
  canvasElement: HTMLElement
}) {
  const canvas = within(canvasElement)
  fireEvent.click(canvas.getByRole("button"))
  await expect(args.onPress).toHaveBeenCalledWith(args.rating ?? 0)
}
