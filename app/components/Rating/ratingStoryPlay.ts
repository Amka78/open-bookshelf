import { expect, fireEvent, waitFor, within } from "@storybook/test"

export async function playFiveStarRendersStars({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const canvas = within(canvasElement)
  // findByTestId 系は「1件以上見つかるまで」しか待たないため、星が4個の時点で解決してしまう。
  // 個数が確定するまで待つには waitFor で件数そのものをアサートする。
  await waitFor(() => expect(canvas.queryAllByTestId("rating-star")).toHaveLength(5))
}

export async function playSelectableRatingPressesHandler({
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
