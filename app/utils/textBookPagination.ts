import type { BookReadingStyleType } from "@/type/types"

export type TextBookSpineLocation = {
  spineIndex: number
  pageInSpine: number
}

export type TextBookProgressLocation = {
  spineIndex: number
  progressInSpine: number
}

export const getEffectiveSpinePageCount = (
  pageCounts: readonly number[],
  spineIndex: number,
) => {
  return Math.max(1, Math.floor(pageCounts[spineIndex] ?? 1))
}

export const getEffectiveSpineContentLength = (
  contentLengths: readonly number[],
  spineIndex: number,
) => {
  return Math.max(1, Math.floor(contentLengths[spineIndex] ?? 1))
}

export const normalizeStoredSpinePageCounts = (
  spineCount: number,
  pageCounts: readonly number[],
) => {
  return Array.from({ length: spineCount }, (_, spineIndex) => {
    const pageCount = pageCounts[spineIndex]
    return typeof pageCount === "number" && Number.isFinite(pageCount) && pageCount > 0
      ? Math.floor(pageCount)
      : 0
  })
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

export const buildSpineContentOffsets = (spineCount: number, contentLengths: readonly number[]) => {
  const offsets: number[] = []
  let totalLength = 0

  for (let spineIndex = 0; spineIndex < spineCount; spineIndex += 1) {
    offsets.push(totalLength)
    totalLength += getEffectiveSpineContentLength(contentLengths, spineIndex)
  }

  return {
    offsets,
    totalLength: Math.max(totalLength, spineCount > 0 ? 1 : 0),
  }
}

const clampDisplayPage = (page: number, totalPages: number) => {
  if (totalPages <= 0) {
    return 0
  }

  return Math.max(0, Math.min(Math.floor(page), totalPages - 1))
}

const clampProgressFraction = (progressFraction: number) => {
  if (!Number.isFinite(progressFraction)) {
    return 0
  }

  return Math.max(0, Math.min(progressFraction, 1))
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

export const estimateSpinePageCounts = (
  spineCount: number,
  measuredPageCounts: readonly number[],
  contentLengths: readonly number[],
) => {
  const normalizedCounts = normalizeStoredSpinePageCounts(spineCount, measuredPageCounts)
  const measuredIndices = normalizedCounts
    .map((pageCount, spineIndex) => ({ pageCount, spineIndex }))
    .filter(({ pageCount }) => pageCount > 0)

  if (measuredIndices.length === 0) {
    return Array.from({ length: spineCount }, () => 1)
  }

  const measuredPageTotal = measuredIndices.reduce((sum, { pageCount }) => sum + pageCount, 0)
  const measuredLengthTotal = measuredIndices.reduce((sum, { spineIndex }) => {
    return sum + getEffectiveSpineContentLength(contentLengths, spineIndex)
  }, 0)
  const averageMeasuredPageCount = measuredPageTotal / measuredIndices.length
  const pagesPerLength = measuredLengthTotal > 0 ? measuredPageTotal / measuredLengthTotal : null

  return Array.from({ length: spineCount }, (_, spineIndex) => {
    const measuredPageCount = normalizedCounts[spineIndex]
    if (measuredPageCount > 0) {
      return measuredPageCount
    }

    if (pagesPerLength !== null) {
      return Math.max(
        1,
        Math.round(getEffectiveSpineContentLength(contentLengths, spineIndex) * pagesPerLength),
      )
    }

    return Math.max(1, Math.round(averageMeasuredPageCount))
  })
}

export const mapProgressFractionToSpineLocation = (
  progressFraction: number,
  spineCount: number,
  contentLengths: readonly number[],
): TextBookProgressLocation => {
  if (spineCount <= 0) {
    return { spineIndex: 0, progressInSpine: 0 }
  }

  const clampedProgress = clampProgressFraction(progressFraction)
  if (clampedProgress >= 1) {
    return { spineIndex: spineCount - 1, progressInSpine: 1 }
  }

  const { offsets, totalLength } = buildSpineContentOffsets(spineCount, contentLengths)
  const targetOffset = clampedProgress * totalLength

  for (let spineIndex = spineCount - 1; spineIndex >= 0; spineIndex -= 1) {
    const spineOffset = offsets[spineIndex] ?? 0
    if (targetOffset >= spineOffset) {
      const spineLength = getEffectiveSpineContentLength(contentLengths, spineIndex)
      return {
        spineIndex,
        progressInSpine: Math.max(
          0,
          Math.min((targetOffset - spineOffset) / spineLength, 1),
        ),
      }
    }
  }

  return { spineIndex: 0, progressInSpine: 0 }
}

export const mapProgressFractionToDisplayPage = (
  progressFraction: number,
  spineCount: number,
  measuredPageCounts: readonly number[],
  contentLengths: readonly number[],
) => {
  if (spineCount <= 0) {
    return 0
  }

  const estimatedPageCounts = estimateSpinePageCounts(spineCount, measuredPageCounts, contentLengths)
  const progressLocation = mapProgressFractionToSpineLocation(progressFraction, spineCount, contentLengths)
  const spinePageCount = getEffectiveSpinePageCount(estimatedPageCounts, progressLocation.spineIndex)
  const pageInSpine =
    spinePageCount <= 1 ? 0 : Math.round(progressLocation.progressInSpine * (spinePageCount - 1))

  return mapSpineLocationToDisplayPage(
    { spineIndex: progressLocation.spineIndex, pageInSpine },
    spineCount,
    estimatedPageCounts,
  )
}

export const mapSpineLocationToProgressFraction = (
  location: TextBookProgressLocation,
  spineCount: number,
  contentLengths: readonly number[],
) => {
  if (spineCount <= 0) {
    return 0
  }

  const { offsets, totalLength } = buildSpineContentOffsets(spineCount, contentLengths)
  const clampedSpineIndex = Math.max(0, Math.min(location.spineIndex, spineCount - 1))
  const clampedProgressInSpine = clampProgressFraction(location.progressInSpine)
  const spineOffset = offsets[clampedSpineIndex] ?? 0
  const spineLength = getEffectiveSpineContentLength(contentLengths, clampedSpineIndex)
  const absoluteOffset = spineOffset + spineLength * clampedProgressInSpine

  return clampProgressFraction(totalLength > 0 ? absoluteOffset / totalLength : 0)
}
