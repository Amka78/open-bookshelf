import type { BookReadingStyleType } from "@/type/types"

export type TextBookSpineLocation = {
  spineIndex: number
  pageInSpine: number
}

export const getEffectiveSpinePageCount = (
  pageCounts: readonly number[],
  spineIndex: number,
) => {
  return Math.max(1, Math.floor(pageCounts[spineIndex] ?? 1))
}

export const buildSpinePageOffsets = (spineCount: number, pageCounts: readonly number[]) => {
  const offsets: number[] = []
  let totalPages = 0

  for (let spineIndex = 0; spineIndex < spineCount; spineIndex += 1) {
    offsets.push(totalPages)
    totalPages += getEffectiveSpinePageCount(pageCounts, spineIndex)
  }

  return {
    offsets,
    totalPages: Math.max(totalPages, spineCount > 0 ? 1 : 0),
  }
}

const clampDisplayPage = (page: number, totalPages: number) => {
  if (totalPages <= 0) {
    return 0
  }

  return Math.max(0, Math.min(Math.floor(page), totalPages - 1))
}

export const normalizeDisplayPageForReadingStyle = (
  page: number,
  totalPages: number,
  readingStyle: BookReadingStyleType,
) => {
  const clampedPage = clampDisplayPage(page, totalPages)

  if (readingStyle === "facingPage") {
    return clampedPage - (clampedPage % 2)
  }

  if (readingStyle === "facingPageWithTitle") {
    if (clampedPage === 0) {
      return 0
    }

    return clampedPage % 2 === 0 ? clampedPage - 1 : clampedPage
  }

  return clampedPage
}

export const mapDisplayPageToSpineLocation = (
  page: number,
  spineCount: number,
  pageCounts: readonly number[],
): TextBookSpineLocation => {
  if (spineCount <= 0) {
    return { spineIndex: 0, pageInSpine: 0 }
  }

  const { offsets, totalPages } = buildSpinePageOffsets(spineCount, pageCounts)
  const targetPage = clampDisplayPage(page, totalPages)

  for (let spineIndex = spineCount - 1; spineIndex >= 0; spineIndex -= 1) {
    const spineOffset = offsets[spineIndex] ?? 0
    if (targetPage >= spineOffset) {
      return {
        spineIndex,
        pageInSpine: targetPage - spineOffset,
      }
    }
  }

  return { spineIndex: 0, pageInSpine: 0 }
}

export const mapSpineLocationToDisplayPage = (
  location: TextBookSpineLocation,
  spineCount: number,
  pageCounts: readonly number[],
) => {
  if (spineCount <= 0) {
    return 0
  }

  const { offsets } = buildSpinePageOffsets(spineCount, pageCounts)
  const spineIndex = Math.max(0, Math.min(location.spineIndex, spineCount - 1))
  const spineOffset = offsets[spineIndex] ?? 0
  const pageCount = getEffectiveSpinePageCount(pageCounts, spineIndex)

  return spineOffset + Math.max(0, Math.min(location.pageInSpine, pageCount - 1))
}
