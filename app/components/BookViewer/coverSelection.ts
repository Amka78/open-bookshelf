import type { FacingPageType } from "./useBookViewerState"

type VisibleCoverTargets = {
  isFacing: boolean
  singlePage?: number
  leftPage?: number
  rightPage?: number
}

export function resolveVisibleCoverTargets(
  currentItem: number | FacingPageType | undefined,
  pageDirection: "left" | "right",
): VisibleCoverTargets {
  if (currentItem === undefined) {
    return {
      isFacing: false,
    }
  }

  if (typeof currentItem === "number") {
    return {
      isFacing: false,
      singlePage: currentItem,
    }
  }

  if (currentItem.page2 === undefined) {
    return {
      isFacing: false,
      singlePage: currentItem.page1,
    }
  }

  return pageDirection === "left"
    ? {
        isFacing: true,
        leftPage: currentItem.page2,
        rightPage: currentItem.page1,
      }
    : {
        isFacing: true,
        leftPage: currentItem.page1,
        rightPage: currentItem.page2,
      }
}
