export type SinglePageGestureNavigateDirection = "next" | "previous"
export type SinglePageGesturePageDirection = "left" | "right"

export type ResolveSinglePageGestureInput = {
  startX: number
  endX: number
  startY: number
  endY: number
  width: number
  pageDirection: SinglePageGesturePageDirection
}

export const SINGLE_PAGE_TAP_MOVE_THRESHOLD = 12
export const SINGLE_PAGE_SWIPE_THRESHOLD = 48

export function resolveSinglePageGesture(
  input: ResolveSinglePageGestureInput,
): SinglePageGestureNavigateDirection | null {
  const dx = input.endX - input.startX
  const dy = input.endY - input.startY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx >= SINGLE_PAGE_SWIPE_THRESHOLD && absDx > absDy) {
    const swipeLeft = dx < 0

    if (input.pageDirection === "left") {
      return swipeLeft ? "previous" : "next"
    }

    return swipeLeft ? "next" : "previous"
  }

  if (absDx <= SINGLE_PAGE_TAP_MOVE_THRESHOLD && absDy <= SINGLE_PAGE_TAP_MOVE_THRESHOLD) {
    const tappedLeftHalf = input.endX < input.width / 2

    if (input.pageDirection === "left") {
      return tappedLeftHalf ? "next" : "previous"
    }

    return tappedLeftHalf ? "previous" : "next"
  }

  return null
}
