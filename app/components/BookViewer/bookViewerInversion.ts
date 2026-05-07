type ResolveBookViewerInversionStrategyInput = {
  isInverted: boolean
  isSinglePagePdfMode: boolean
  platformOS: string
}

export function resolveBookViewerInversionStrategy(
  input: ResolveBookViewerInversionStrategyInput,
) {
  const usesFlashList = !input.isSinglePagePdfMode

  return {
    useReversedData: input.isInverted && usesFlashList && input.platformOS === "web",
    useTransformInvert: input.isInverted && usesFlashList && input.platformOS === "android",
  }
}

export function mapBookViewerIndex(index: number, itemCount: number, reverse: boolean) {
  if (!reverse || itemCount <= 0) {
    return index
  }

  return itemCount - 1 - index
}
