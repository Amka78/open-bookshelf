type ResolveBookViewerInversionStrategyInput = {
  isInverted: boolean
  isSinglePagePdfMode: boolean
  platformOS: string
}

/**
 * RTL（右開き）表示の反転方式と、横読みのページング方式をプラットフォームごとに決める。
 *
 * 反転方式は3系統あり、いずれも実測に基づいて選ばれている。
 * - ios: FlashList の `inverted` prop
 * - android: コンテナと各アイテムに `scaleX: -1` を掛ける double flip（`useTransformInvert`）
 * - web: data を reverse（`useReversedData`）。web で `inverted` prop は動かず、
 *   double flip も祖先の CSS transform によって DOM の幾何計測が鏡像化し、FlashList の
 *   firstItemOffset が誤値になって可視アイテムがゼロ（画面が真っ暗・操作不能）になるため、
 *   reverse 方式しか使えない。
 *
 * ページング: react-native-web は `pagingEnabled` を `scroll-snap-type: x mandatory` と
 * 各子への `scroll-snap-align: start` で実装する。FlashList の仮想化では子が mount/unmount
 * されるたびにスナップ点が失われ、mandatory 指定によりスクロール位置が 0 へ強制的に
 * 引き戻される。reverse 方式では offset 0 = 最終ページなので、開くたびに最終ページが表示
 * される。そのため web では pagingEnabled を無効化し、scroll の idle 検出でページ境界に合わせる。
 */
export function resolveBookViewerInversionStrategy(input: ResolveBookViewerInversionStrategyInput) {
  const usesFlashList = !input.isSinglePagePdfMode

  return {
    useReversedData: input.isInverted && usesFlashList && input.platformOS === "web",
    useTransformInvert: input.isInverted && usesFlashList && input.platformOS === "android",
    usePagingEnabled: input.platformOS !== "web",
  }
}

export function mapBookViewerIndex(index: number, itemCount: number, reverse: boolean) {
  if (!reverse || itemCount <= 0) {
    return index
  }

  return itemCount - 1 - index
}
