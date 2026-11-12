import {
  Box,
  GradientBackground,
  HStack,
  PageManager,
  PagePressable,
  ViewerHeader,
} from "@/components"
import { AnnotationPanel } from "@/components/AnnotationPanel"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useLatestCallback } from "@/hooks/useLatestCallback"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useAnnotations } from "@/screens/ViewerScreen/useAnnotations"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { usePalette } from "@/theme"
import { logger } from "@/utils/logger"
import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { useNavigation } from "@react-navigation/native"
import { FlashList, type FlashListRef, type ListRenderItem } from "@shopify/flash-list"
import { observer } from "mobx-react-lite"
import React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  type FlexAlignType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { mapBookViewerIndex, resolveBookViewerInversionStrategy } from "./bookViewerInversion"
import { resolveVisibleCoverTargets } from "./coverSelection"
import { SINGLE_PAGE_TAP_MOVE_THRESHOLD, resolveSinglePageGesture } from "./pdfSinglePageGestures"
import { type FacingPageType, type FlashListHandle, useBookViewerState } from "./useBookViewerState"

const runOnNextFrame = (callback: () => void) => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(() => {
      callback()
    })
  }

  return setTimeout(callback, 0) as unknown as number
}

const cancelScheduledFrame = (id: number) => {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(id)
    return
  }

  clearTimeout(id)
}

export type RenderPageProps = {
  page: number
  direction: "next" | "previous"
  pageType: "singlePage" | "leftPage" | "rightPage"
  scrollIndex: number
  availableWidth: number
  availableHeight?: number
  onPress?: () => void
  onLongPress?: () => void
  annotations?: Array<{ uuid: string; highlightedText: string | null; styleWhich: string | null }>
  onTextSelect?: (text: string) => void
}
export type BookViewerProps = {
  totalPage: number
  renderPage: (props: RenderPageProps) => React.ReactNode
  bookTitle: string
  onPageChange?: (page: number) => void
  onLastPage?: () => void
  initialPage?: number
  performanceMode?: "default" | "android-pdf" | "web-pdf" | "pdf-single-page"
  disableNavigation?: boolean
  seriesInfo?: import("@/components/ViewerHeader/ViewerHeader").SeriesNavigationInfo | null
  onPreviousSeriesBook?: () => void
  onNextSeriesBook?: () => void
}

type FlashListCompatProps = {
  key?: string
  data: number[] | FacingPageType[]
  extraData?: unknown
  renderItem: ListRenderItem<number | FacingPageType>
  horizontal?: boolean
  pagingEnabled?: boolean
  inverted?: boolean
  ref?: React.Ref<FlashListRef<number | FacingPageType>>
  keyExtractor?: (_: number | FacingPageType, index: number) => string
  onViewableItemsChanged?: (info: {
    viewableItems: { index?: number | null; isViewable?: boolean }[]
  }) => void
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  viewabilityConfig?: { itemVisiblePercentThreshold: number }
  estimatedItemSize?: number
  estimatedListSize?: { width: number; height: number }
  drawDistance?: number
  overrideItemLayout?: (
    layout: { span?: number; size?: number; offset?: number },
    item: number | FacingPageType,
    index: number,
  ) => void
  removeClippedSubviews?: boolean
  windowSize?: number
  initialNumToRender?: number
  maxToRenderPerBatch?: number
}

function FlashListCompat(props: FlashListCompatProps) {
  return React.createElement(
    FlashList as unknown as React.ComponentType<Record<string, unknown>>,
    props as unknown as Record<string, unknown>,
  )
}

export const BookViewer = observer(function BookViewer(props: BookViewerProps) {
  const { renderPage: renderPageProp, disableNavigation } = props
  const palette = usePalette()
  const viewerHook = useViewer()
  const { settingStore } = useStores()
  const modal = useElectrobunModal()
  const {
    annotations,
    addBookmark,
    addHighlight,
    deleteAnnotation,
    annotationsForPage,
    exportAnnotationsAsMarkdown,
  } = useAnnotations()
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [jumpRequest, setJumpRequest] = useState<{ page: number; id: number } | null>(null)

  const dimension = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const listViewportWidth = Math.max(1, dimension.width - insets.left - insets.right)

  const navigation = useNavigation<ApppNavigationProp>()
  const isWeb = Platform.OS === "web"
  const isAndroidPdfMode = props.performanceMode === "android-pdf" && Platform.OS === "android"
  const isWebPdfMode = props.performanceMode === "web-pdf" && Platform.OS === "web"
  const isSinglePagePdfMode =
    props.performanceMode === "pdf-single-page" ||
    props.performanceMode === "web-pdf" ||
    (props.performanceMode === "android-pdf" && Platform.OS === "android")
  const isHorizontalReading = viewerHook.readingStyle !== "verticalScroll"
  const flashListAxisKey = isHorizontalReading ? "horizontal" : "vertical"
  const isInverted =
    viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
  const { useReversedData, useTransformInvert, usePagingEnabled } =
    resolveBookViewerInversionStrategy({
      isInverted,
      isSinglePagePdfMode,
      platformOS: Platform.OS,
    })
  const flashListInstanceRef = useRef<FlashListRef<number | FacingPageType>>(null)
  const flashListDisplayStateRef = useRef({ itemCount: 0, useReversedData: false })
  const flashListRef = useRef<FlashListHandle>({
    scrollToIndex: (params) => {
      const mappedIndex = mapBookViewerIndex(
        params.index,
        flashListDisplayStateRef.current.itemCount,
        flashListDisplayStateRef.current.useReversedData,
      )

      return (
        flashListInstanceRef.current?.scrollToIndex({
          ...params,
          index: mappedIndex,
        }) ?? Promise.resolve()
      )
    },
  })
  const {
    pages,
    data,
    scrollIndex,
    currentPage,
    autoPageTurning,
    setAutoPageTurning,
    autoPageTurnIntervalMs,
    setAutoPageTurnIntervalMs,
    onViewableItemsChanged,
    syncScrollIndex,
    scrollToIndex,
    getScrollIndexForPage,
    getIndexForReadingStyleChange,
  } = useBookViewerState({
    totalPage: props.totalPage,
    initialPage: props.initialPage,
    readingStyle: viewerHook.readingStyle,
    onPageChange: props.onPageChange,
    onLastPage: props.onLastPage,
    initialAutoPageTurnIntervalMs: settingStore.autoPageTurnIntervalMs,
    flashListRef,
  })
  const displayData: typeof data = useReversedData ? ([...data].reverse() as typeof data) : data
  // Layout effect so the ref is fresh before the viewer hook's passive effects
  // (initial page / reading-style conversion) call scrollToIndex in the same commit.
  useLayoutEffect(() => {
    flashListDisplayStateRef.current = { itemCount: displayData.length, useReversedData }
  }, [displayData.length, useReversedData])

  // biome-ignore lint/correctness/useExhaustiveDependencies: jumpRequest.id is the only meaningful change trigger; full object would cause infinite loops
  useEffect(() => {
    if (jumpRequest == null || !data.length) return
    const idx = getScrollIndexForPage(jumpRequest.page)
    scrollToIndex(idx, true)
  }, [jumpRequest?.id])

  // Ref for scrollIndex: used only in logging inside renderPage.
  // Keeping scrollIndex out of renderPage's reactive deps avoids recreating
  // the page renderer on every page turn, which would force FlashList to
  // re-render all visible items.
  const scrollIndexRef = useRef(scrollIndex)
  useEffect(() => {
    scrollIndexRef.current = scrollIndex
  }, [scrollIndex])

  // Stable wrapper for the latest handler. Passing the raw viewerHook.onManageMenu
  // (recreated every render) as a prop would recreate renderPage every render.
  const onManageMenu = useLatestCallback(viewerHook.onManageMenu)

  // Extract readingStyle as a primitive dep so renderPage is only recreated on style changes,
  // not on every page turn (which would change the whole viewerHook object reference).
  const viewerReadingStyle = viewerHook.readingStyle

  const handleShowToc = () => {
    const toc = viewerHook.toc
    if (!toc) return
    modal.openModal("TocModal", {
      toc,
      onNavigate: (dest: string) => {
        const page = viewerHook.goToTocEntry(dest)
        setJumpRequest({ page, id: Date.now() })
      },
    })
  }

  const handleShowReadingSettings = () => {
    modal.openModal("ReadingSettingsModal", {
      autoPageTurnIntervalMs,
      onAutoPageTurnIntervalChange: (intervalMs) => {
        const normalizedIntervalMs = Math.max(100, Math.floor(intervalMs))
        settingStore.setAutoPageTurnIntervalMs(normalizedIntervalMs)
        setAutoPageTurnIntervalMs(normalizedIntervalMs)
      },
    })
  }

  // scrollIndex is read through a ref and viewerHook.onManageMenu through a
  // latest-callback, so page turns do not recreate renderPage.
  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      const handlePagePress = () => {
        const targetIndex =
          renderProps.direction === "previous"
            ? goToPreviousPage(renderProps.scrollIndex, 1)
            : goToNextPage(renderProps.scrollIndex, pages![viewerReadingStyle].length, 1)

        scrollToIndex(targetIndex, true, isHorizontalReading ? undefined : 0.5)
      }

      const pageProps = {
        ...renderProps,
        onPress: handlePagePress,
        onLongPress: onManageMenu,
        annotations: annotationsForPage(renderProps.page)
          .filter((a) => a.type === "highlight")
          .map((a) => ({
            uuid: a.uuid,
            highlightedText: a.highlightedText,
            styleWhich: a.styleWhich,
          })),
        onTextSelect: (text: string) => {
          modal.openModal("AnnotationModal", {
            selectedText: text,
            onSave: async ({ text: selText, notes, styleWhich }) => {
              await addHighlight(renderProps.page, selText ?? text, notes || undefined, styleWhich)
            },
          })
        },
      }

      let alignItems: FlexAlignType = "center"

      switch (renderProps.pageType) {
        case "singlePage":
          alignItems = "center"
          break
        case "leftPage":
          alignItems = "flex-end"
          break
        case "rightPage":
          alignItems = "flex-start"
          break
      }

      return (
        <PagePressable
          currentPage={renderProps.scrollIndex}
          direction={renderProps.direction}
          onLongPress={onManageMenu}
          disabled={disableNavigation}
          onPageChanging={(page) => {
            logger.debug(`current scroll index ${scrollIndexRef.current}`)
            logger.debug(`page pressed next page:${page}`)
            scrollToIndex(page, true, isHorizontalReading ? undefined : 0.5)
          }}
          totalPages={pages![viewerReadingStyle].length}
          transitionPages={1}
          style={{
            ...(isHorizontalReading ? styles.pageRoot : styles.verticalPageRoot),
            alignItems,
            width: renderProps.availableWidth,
          }}
        >
          {renderPageProp(pageProps)}
        </PagePressable>
      )
    },
    [
      isHorizontalReading,
      pages,
      viewerReadingStyle,
      renderPageProp,
      disableNavigation,
      scrollToIndex,
      annotationsForPage,
      addHighlight,
      modal,
      onManageMenu,
    ],
  )

  // viewerHook.pageDirection accessed as property for granular dep tracking
  const renderItemContent = useCallback(
    (item: number | FacingPageType, index: number) => {
      let renderComp: React.JSX.Element
      if (typeof item === "number" || (item as FacingPageType).page2 === undefined) {
        const num = typeof item === "number" ? item : (item as FacingPageType).page1
        renderComp = (
          <Box
            width={listViewportWidth}
            height={isHorizontalReading ? dimension.height : undefined}
            style={useTransformInvert ? styles.scaleXInverted : {}}
          >
            {renderPage({
              page: num ?? 0,
              direction: "next",
              pageType: "singlePage",
              scrollIndex: index,
              availableWidth: listViewportWidth,
              availableHeight: isHorizontalReading ? dimension.height : undefined,
            })}
          </Box>
        )
      } else {
        const leftPage = renderPage({
          page: viewerHook.pageDirection === "left" ? item.page2 ?? 0 : item.page1 ?? 0,
          direction: viewerHook.pageDirection === "left" ? "next" : "previous",
          pageType: "leftPage",
          scrollIndex: index,
          availableWidth: listViewportWidth / 2,
          availableHeight: dimension.height,
        })
        const rightPage = renderPage({
          page: viewerHook.pageDirection === "left" ? item.page1 ?? 0 : item.page2 ?? 0,
          direction: viewerHook.pageDirection === "left" ? "previous" : "next",
          pageType: "rightPage",
          scrollIndex: index,
          availableWidth: listViewportWidth / 2,
          availableHeight: dimension.height,
        })
        renderComp = (
          <HStack
            width={listViewportWidth}
            height={dimension.height}
            style={useTransformInvert ? styles.scaleXInverted : {}}
          >
            {leftPage}
            {rightPage}
          </HStack>
        )
      }

      return renderComp
    },
    [
      dimension.height,
      isHorizontalReading,
      listViewportWidth,
      renderPage,
      useTransformInvert,
      viewerHook.pageDirection,
    ],
  )

  const renderItem: ListRenderItem<number | FacingPageType> = useCallback(
    ({ item, index }) => {
      return renderItemContent(item, mapBookViewerIndex(index, displayData.length, useReversedData))
    },
    [displayData.length, renderItemContent, useReversedData],
  )

  const estimatedItemSize =
    viewerHook.readingStyle === "verticalScroll" ? dimension.height : listViewportWidth
  const flashListLayoutKey = `${viewerHook.readingStyle}:${viewerHook.pageDirection}:${listViewportWidth}x${dimension.height}`
  const currentHorizontalLayoutKey =
    viewerHook.readingStyle === "verticalScroll" ? undefined : flashListLayoutKey
  // 各アイテムはちょうどビューポート1枚分なので、サイズと位置を事前確定できる。
  // web では DOM 計測に任せた場合にアイテム幅が listViewportWidth からずれる
  // （実測: scrollWidth / itemCount ≈ 782 に対し listViewportWidth 742）ため、
  // ページ境界の算出が壊れる。android と同様に overrideItemLayout でサイズを与える。
  const useFixedItemSize = isHorizontalReading
  // removeClippedSubviews の web 有効化は未検証のため、従来の範囲を維持する
  const useFixedItemLayout = isHorizontalReading && !isWeb
  const windowSize = isAndroidPdfMode ? 2 : isWebPdfMode ? 10 : isWeb ? 5 : 3
  const maxToRenderPerBatch = isAndroidPdfMode ? 1 : isWebPdfMode ? 4 : 2
  const drawDistance = isAndroidPdfMode ? estimatedItemSize : undefined
  const webViewportStyle = isWeb
    ? ({ height: dimension.height, maxHeight: dimension.height } as const)
    : undefined
  const listContainerStyle = useTransformInvert ? styles.listInverted : styles.list
  const invertedProps = {
    inverted: isInverted && !useTransformInvert && !useReversedData,
  } as unknown as Record<string, boolean>
  const latestHorizontalIndexRef = useRef(scrollIndex)
  const currentRenderedIndex = Math.max(0, Math.min(scrollIndex, Math.max(data.length - 1, 0)))
  const currentRenderedItem = data[currentRenderedIndex]
  const currentCoverTargets = resolveVisibleCoverTargets(
    currentRenderedItem as number | FacingPageType | undefined,
    viewerHook.pageDirection,
  )
  const currentSinglePageTapNavigationMode =
    typeof currentRenderedItem === "number" ||
    (currentRenderedItem as FacingPageType | undefined)?.page2 === undefined
      ? "single"
      : "spread"
  const singlePageTouchStartRef = useRef<
    { x: number; y: number; longPressTriggered: boolean } | undefined
  >(undefined)
  const singlePageLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSinglePageLongPressTimer = () => {
    if (singlePageLongPressTimerRef.current != null) {
      clearTimeout(singlePageLongPressTimerRef.current)
      singlePageLongPressTimerRef.current = null
    }
  }

  const navigateSinglePageDirection = (baseIndex: number, direction: "next" | "previous") => {
    const targetIndex =
      direction === "previous"
        ? goToPreviousPage(baseIndex, 1)
        : goToNextPage(baseIndex, data.length, 1)

    scrollToIndex(targetIndex, true, isHorizontalReading ? undefined : 0.5)
  }

  useEffect(() => {
    latestHorizontalIndexRef.current = scrollIndex
  }, [scrollIndex])

  useEffect(() => {
    return () => {
      clearSinglePageLongPressTimer()
    }
  }, [clearSinglePageLongPressTimer])

  useEffect(() => {
    if (!pages || !currentHorizontalLayoutKey) {
      return undefined
    }

    let secondFrame: number | undefined
    const firstFrame = runOnNextFrame(() => {
      secondFrame = runOnNextFrame(() => {
        flashListRef.current?.scrollToIndex({
          index: latestHorizontalIndexRef.current,
          animated: false,
        })
      })
    })

    return () => {
      cancelScheduledFrame(firstFrame)
      if (secondFrame !== undefined) {
        cancelScheduledFrame(secondFrame)
      }
    }
  }, [currentHorizontalLayoutKey, pages])

  // react-native-web は onMomentumScrollEnd / onScrollEndDrag を発火しない
  // （ScrollViewBase の handleScrollEnd が呼ぶのは onScroll のみ）ため、web では
  // scroll イベントの idle 検出でページ境界にスナップさせる。
  // pagingEnabled を web で無効化していることの代替。無効化の理由は RN-web が
  // pagingEnabled を scroll-snap-type: x mandatory + 各子への scroll-snap-align: start で
  // 実装しており、FlashList の仮想化で子が mount/unmount されるたびにスナップ点が失われ、
  // mandatory 指定によってスクロール位置が 0 へ強制的に引き戻されるため。
  // 反転データでは offset 0 = 最終ページなので、常に最終ページが表示されていた。
  useEffect(() => {
    if (!isWeb || !isHorizontalReading) {
      return undefined
    }
    const node = flashListInstanceRef.current?.getScrollableNode() as HTMLElement | null
    if (!node) {
      return undefined
    }

    // スクロールが止まってからスナップするまでの待機時間
    const scrollIdleMs = 120
    const pageSize = estimatedItemSize
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const snapToNearestPage = () => {
      if (pageSize <= 0 || data.length === 0) {
        return
      }

      const physicalIndex = Math.max(
        0,
        Math.min(Math.round(node.scrollLeft / pageSize), data.length - 1),
      )
      // overrideItemLayout により1アイテム = pageSize が保証されるので、
      // 境界までの差が誤差程度なら何もしない（スナップの無限ループ防止）
      if (Math.abs(node.scrollLeft - physicalIndex * pageSize) <= 2) {
        return
      }

      scrollToIndex(mapBookViewerIndex(physicalIndex, data.length, useReversedData), true)
    }

    const onScroll = () => {
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer)
      }
      idleTimer = setTimeout(snapToNearestPage, scrollIdleMs)
    }

    node.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      node.removeEventListener("scroll", onScroll)
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer)
      }
    }
  }, [data.length, estimatedItemSize, isHorizontalReading, isWeb, scrollToIndex, useReversedData])

  const onListScrollSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!data.length) {
      return
    }

    const pageSize = isHorizontalReading ? listViewportWidth : dimension.height
    if (pageSize <= 0) {
      return
    }

    const offset = isHorizontalReading
      ? event.nativeEvent.contentOffset.x
      : event.nativeEvent.contentOffset.y
    const rawIndex = Math.round(offset / pageSize)
    const clampedRawIndex = Math.max(0, Math.min(rawIndex, data.length - 1))
    const resolvedIndex =
      isInverted && !useTransformInvert ? data.length - 1 - clampedRawIndex : clampedRawIndex

    syncScrollIndex(resolvedIndex)
  }

  return (
    <View style={styles.viewerContainer}>
      <GradientBackground
        colors={palette.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.viewerGradient, webViewportStyle ?? {}]}
      >
        <ViewerHeader
          title={props.bookTitle}
          visible={viewerHook.showMenu}
          autoPageTurning={autoPageTurning}
          onToggleAutoPageTurning={() => {
            setAutoPageTurning((prev) => !prev)
          }}
          onLeftArrowPress={() => {
            navigation.goBack()
          }}
          pageDirection={viewerHook.pageDirection}
          readingStyle={viewerHook.readingStyle}
          onSelectReadingStyle={(newReadingStyle) => {
            const nextIndex = getIndexForReadingStyleChange(newReadingStyle)
            if (nextIndex !== undefined) {
              scrollToIndex(nextIndex, true, newReadingStyle === "verticalScroll" ? 0.5 : undefined)
            }
            viewerHook.onSetBookReadingStyle(newReadingStyle)
          }}
          onSelectPageDirection={(pageDirection) => {
            viewerHook.onSetPageDirection(pageDirection)
          }}
          onSelectCurrentPageAsCover={
            currentCoverTargets.singlePage !== undefined
              ? () => {
                  viewerHook.onSetCoverByPage(currentCoverTargets.singlePage as number)
                }
              : undefined
          }
          onSelectLeftPageAsCover={
            currentCoverTargets.leftPage !== undefined
              ? () => {
                  viewerHook.onSetCoverByPage(currentCoverTargets.leftPage as number)
                }
              : undefined
          }
          onSelectRightPageAsCover={
            currentCoverTargets.rightPage !== undefined
              ? () => {
                  viewerHook.onSetCoverByPage(currentCoverTargets.rightPage as number)
                }
              : undefined
          }
          onAddBookmark={() => {
            modal.openModal("AnnotationModal", {
              supportsHighlight: false,
              onSave: async ({ notes }) => {
                await addBookmark(currentPage, notes || undefined)
              },
            })
          }}
          onToggleAnnotationPanel={() => setShowAnnotationPanel((prev) => !prev)}
          supportsHighlight={false}
          onShowToc={viewerHook.toc ? handleShowToc : undefined}
          onShowReadingSettings={handleShowReadingSettings}
        />
        {pages && isSinglePagePdfMode ? (
          <Box style={styles.viewerRoot} alignSelf="center" width={listViewportWidth}>
            <Box style={listContainerStyle}>
              {data.length > 0
                ? renderItemContent(data[currentRenderedIndex], currentRenderedIndex)
                : null}
              {data.length > 1 ? (
                <View
                  style={styles.singlePageOverlay}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={(event) => {
                    const { locationX, locationY } = event.nativeEvent
                    singlePageTouchStartRef.current = {
                      x: locationX,
                      y: locationY,
                      longPressTriggered: false,
                    }

                    clearSinglePageLongPressTimer()
                    singlePageLongPressTimerRef.current = setTimeout(() => {
                      if (singlePageTouchStartRef.current) {
                        singlePageTouchStartRef.current.longPressTriggered = true
                      }
                      viewerHook.onManageMenu()
                    }, 350)
                  }}
                  onResponderMove={(event) => {
                    const start = singlePageTouchStartRef.current
                    if (!start) return

                    const dx = Math.abs(event.nativeEvent.locationX - start.x)
                    const dy = Math.abs(event.nativeEvent.locationY - start.y)

                    if (
                      dx > SINGLE_PAGE_TAP_MOVE_THRESHOLD ||
                      dy > SINGLE_PAGE_TAP_MOVE_THRESHOLD
                    ) {
                      clearSinglePageLongPressTimer()
                    }
                  }}
                  onResponderRelease={(event) => {
                    const start = singlePageTouchStartRef.current
                    clearSinglePageLongPressTimer()
                    singlePageTouchStartRef.current = undefined

                    if (!start || disableNavigation || start.longPressTriggered) {
                      return
                    }

                    const direction = resolveSinglePageGesture({
                      startX: start.x,
                      endX: event.nativeEvent.locationX,
                      startY: start.y,
                      endY: event.nativeEvent.locationY,
                      width: listViewportWidth,
                      pageDirection: viewerHook.pageDirection,
                      tapNavigationMode: currentSinglePageTapNavigationMode,
                    })

                    if (direction) {
                      navigateSinglePageDirection(currentRenderedIndex, direction)
                    }
                  }}
                  onResponderTerminate={() => {
                    clearSinglePageLongPressTimer()
                    singlePageTouchStartRef.current = undefined
                  }}
                />
              ) : null}
            </Box>
          </Box>
        ) : pages ? (
          <Box style={styles.viewerRoot} alignSelf="center" width={listViewportWidth}>
            <Box style={listContainerStyle}>
              <FlashListCompat
                key={flashListAxisKey}
                data={displayData}
                extraData={flashListLayoutKey}
                renderItem={renderItem}
                horizontal={isHorizontalReading}
                // web で pagingEnabled を有効にすると RN-web が scroll-snap-type: x mandatory を
                // 付与し、FlashList の仮想化と衝突してスクロール位置が 0 へ引き戻される。
                // 代わりに上記の idle 検出によるスナップでページ合わせを行う。
                pagingEnabled={isHorizontalReading && usePagingEnabled}
                {...invertedProps}
                ref={flashListInstanceRef}
                keyExtractor={(_, index) => `${index}`}
                onViewableItemsChanged={isHorizontalReading ? undefined : onViewableItemsChanged}
                onMomentumScrollEnd={isHorizontalReading ? onListScrollSettled : undefined}
                onScrollEndDrag={
                  isHorizontalReading && !isAndroidPdfMode && !isWeb
                    ? onListScrollSettled
                    : undefined
                }
                viewabilityConfig={{
                  itemVisiblePercentThreshold: isWeb ? 95 : 100,
                }}
                estimatedItemSize={estimatedItemSize}
                estimatedListSize={{ width: listViewportWidth, height: dimension.height }}
                drawDistance={drawDistance}
                overrideItemLayout={
                  !useFixedItemSize
                    ? undefined
                    : (layout, _, index) => {
                        const mutableLayout = layout as {
                          span?: number
                          size?: number
                          offset?: number
                        }
                        mutableLayout.size = estimatedItemSize
                        mutableLayout.offset = estimatedItemSize * index
                      }
                }
                removeClippedSubviews={useFixedItemLayout}
                windowSize={windowSize}
                initialNumToRender={1}
                maxToRenderPerBatch={maxToRenderPerBatch}
              />
            </Box>
          </Box>
        ) : null}
        <PageManager
          currentPage={currentPage ?? 0}
          variant="fix"
          facingPage={
            viewerHook.readingStyle === "facingPage" ||
            viewerHook.readingStyle === "facingPageWithTitle"
          }
          facingSecondPageExists={
            pages !== undefined &&
            (pages![viewerHook.readingStyle][scrollIndex] as FacingPageType | undefined)?.page2 !==
              undefined
          }
          totalPage={props.totalPage}
          onPageChange={(page) => {
            const index = getScrollIndexForPage(page)
            scrollToIndex(index, true, isHorizontalReading ? undefined : 0.5)
          }}
          reverse={
            viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
          }
          visible={viewerHook.showMenu}
          seriesInfo={props.seriesInfo}
          onPreviousSeriesBook={props.onPreviousSeriesBook}
          onNextSeriesBook={props.onNextSeriesBook}
        />
      </GradientBackground>
      {showAnnotationPanel ? (
        <View style={styles.annotationPanelOverlay}>
          <AnnotationPanel
            annotations={annotations.slice()}
            supportsHighlight={false}
            onAnnotationPress={(annotation) => {
              setShowAnnotationPanel(false)
              const targetIndex = getScrollIndexForPage(annotation.spineIndex)
              scrollToIndex(targetIndex, true)
            }}
            onDeleteAnnotation={(uuid) => {
              deleteAnnotation(uuid)
            }}
            onExport={async () => {
              const markdown = exportAnnotationsAsMarkdown(props.bookTitle)
              await Share.share({ message: markdown })
            }}
          />
        </View>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
  },
  viewerGradient: {
    flex: 1,
  },
  annotationPanelOverlay: {
    ...StyleSheet.absoluteFill,
    top: 50,
    backgroundColor: "rgba(255,255,255,0.97)",
    zIndex: 10,
  },
  pageRoot: {
    flex: 1,
    justifyContent: "center",
    zIndex: 0,
  },
  verticalPageRoot: {
    zIndex: 0,
  },
  viewerRoot: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listInverted: {
    flex: 1,
    transform: [{ scaleX: -1 }],
  },
  singlePageOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  scaleXInverted: {
    transform: [{ scaleX: -1 }],
  },
})
