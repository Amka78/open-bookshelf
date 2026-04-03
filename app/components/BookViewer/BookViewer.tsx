import {
  Box,
  GradientBackground,
  HStack,
  PageManager,
  PagePressable,
  ViewerHeader,
} from "@/components"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { usePalette } from "@/theme"
import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { useNavigation } from "@react-navigation/native"
import { FlashList, type FlashListRef, type ListRenderItem } from "@shopify/flash-list"
import React from "react"
import { useCallback, useEffect, useRef } from "react"
import {
  type FlexAlignType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { resolveVisibleCoverTargets } from "./coverSelection"
import { SINGLE_PAGE_TAP_MOVE_THRESHOLD, resolveSinglePageGesture } from "./pdfSinglePageGestures"
import { type FacingPageType, useBookViewerState } from "./useBookViewerState"

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

export function BookViewer(props: BookViewerProps) {
  const palette = usePalette()
  const viewerHook = useViewer()
  const { settingStore } = useStores()

  const flashListRef = useRef<FlashListRef<number | FacingPageType>>(null)

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
  // Android: FlashList の inverted が動作しないため scaleX: -1 で代替する
  const useTransformInvert = isInverted && Platform.OS === "android"
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

  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      const handlePagePress = () => {
        const targetIndex =
          renderProps.direction === "previous"
            ? goToPreviousPage(renderProps.scrollIndex, 1)
            : goToNextPage(renderProps.scrollIndex, pages[viewerHook.readingStyle].length, 1)

        scrollToIndex(targetIndex, true, isHorizontalReading ? undefined : 0.5)
      }

      const pageProps = {
        ...renderProps,
        onPress: handlePagePress,
        onLongPress: viewerHook.onManageMenu,
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
          onLongPress={viewerHook.onManageMenu}
          disabled={props.disableNavigation}
          onPageChanging={(page) => {
            console.tron.log(`current scroll index ${scrollIndex}`)
            console.tron.log(`page pressed next page:${page}`)
            scrollToIndex(page, true, isHorizontalReading ? undefined : 0.5)
          }}
          totalPages={pages[viewerHook.readingStyle].length}
          transitionPages={1}
          style={{
            ...(isHorizontalReading ? styles.pageRoot : styles.verticalPageRoot),
            alignItems,
            width: renderProps.availableWidth,
          }}
        >
          {props.renderPage(pageProps)}
        </PagePressable>
      )
    },
    [
      isHorizontalReading,
      pages,
      props.renderPage,
      props.disableNavigation,
      scrollIndex,
      scrollToIndex,
      viewerHook,
    ],
  )

  const renderItemContent = useCallback(
    (item: number | FacingPageType, index: number) => {
      let renderComp: React.JSX.Element
      if (typeof item === "number" || (item as FacingPageType).page2 === undefined) {
        const num = typeof item === "number" ? item : (item as FacingPageType).page1
        renderComp = (
          <Box
            width={listViewportWidth}
            height={isHorizontalReading ? dimension.height : undefined}
            style={useTransformInvert ? styles.scaleXInverted : undefined}
          >
            {renderPage({
              page: num,
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
          page: viewerHook.pageDirection === "left" ? item.page2 : item.page1,
          direction: viewerHook.pageDirection === "left" ? "next" : "previous",
          pageType: "leftPage",
          scrollIndex: index,
          availableWidth: listViewportWidth / 2,
          availableHeight: dimension.height,
        })
        const rightPage = renderPage({
          page: viewerHook.pageDirection === "left" ? item.page1 : item.page2,
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
            style={useTransformInvert ? styles.scaleXInverted : undefined}
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
      return renderItemContent(item, index)
    },
    [renderItemContent],
  )

  const estimatedItemSize =
    viewerHook.readingStyle === "verticalScroll" ? dimension.height : listViewportWidth
  const flashListLayoutKey = `${viewerHook.readingStyle}:${viewerHook.pageDirection}:${listViewportWidth}x${dimension.height}`
  const currentHorizontalLayoutKey =
    viewerHook.readingStyle === "verticalScroll" ? undefined : flashListLayoutKey
  const useFixedItemLayout = isHorizontalReading && !isWeb
  const windowSize = isAndroidPdfMode ? 2 : isWebPdfMode ? 10 : isWeb ? 5 : 3
  const maxToRenderPerBatch = isAndroidPdfMode ? 1 : isWebPdfMode ? 4 : 2
  const drawDistance = isAndroidPdfMode ? estimatedItemSize : undefined
  const webViewportStyle = isWeb
    ? ({ height: dimension.height, maxHeight: dimension.height } as const)
    : undefined
  const listContainerStyle = useTransformInvert ? styles.listInverted : styles.list
  const invertedProps = {
    inverted: isInverted && !useTransformInvert,
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

  const clearSinglePageLongPressTimer = useCallback(() => {
    if (singlePageLongPressTimerRef.current != null) {
      clearTimeout(singlePageLongPressTimerRef.current)
      singlePageLongPressTimerRef.current = null
    }
  }, [])

  const navigateSinglePageDirection = useCallback(
    (baseIndex: number, direction: "next" | "previous") => {
      const targetIndex =
        direction === "previous"
          ? goToPreviousPage(baseIndex, 1)
          : goToNextPage(baseIndex, data.length, 1)

      scrollToIndex(targetIndex, true, isHorizontalReading ? undefined : 0.5)
    },
    [data.length, isHorizontalReading, scrollToIndex],
  )

  useEffect(() => {
    latestHorizontalIndexRef.current = scrollIndex
  }, [scrollIndex])

  useEffect(() => {
    return () => {
      clearSinglePageLongPressTimer()
    }
  }, [clearSinglePageLongPressTimer])

  const scheduleHorizontalRecenter = useCallback(() => {
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
  }, [])

  useEffect(() => {
    if (!pages || !currentHorizontalLayoutKey) {
      return undefined
    }

    return scheduleHorizontalRecenter()
  }, [currentHorizontalLayoutKey, pages, scheduleHorizontalRecenter])

  const onListScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
    },
    [
      data.length,
      dimension.height,
      isInverted,
      isHorizontalReading,
      listViewportWidth,
      syncScrollIndex,
      useTransformInvert,
    ],
  )

  return (
    <GradientBackground
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.viewerGradient, webViewportStyle]}
    >
      <ViewerHeader
        title={props.bookTitle}
        visible={viewerHook.showMenu}
        autoPageTurning={autoPageTurning}
        autoPageTurnIntervalMs={autoPageTurnIntervalMs}
        onToggleAutoPageTurning={() => {
          setAutoPageTurning((prev) => !prev)
        }}
        onAutoPageTurnIntervalChange={(intervalMs) => {
          const normalizedIntervalMs = Math.max(100, Math.floor(intervalMs))
          settingStore.setAutoPageTurnIntervalMs(normalizedIntervalMs)
          setAutoPageTurnIntervalMs(normalizedIntervalMs)
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

                  if (dx > SINGLE_PAGE_TAP_MOVE_THRESHOLD || dy > SINGLE_PAGE_TAP_MOVE_THRESHOLD) {
                    clearSinglePageLongPressTimer()
                  }
                }}
                onResponderRelease={(event) => {
                  const start = singlePageTouchStartRef.current
                  clearSinglePageLongPressTimer()
                  singlePageTouchStartRef.current = undefined

                  if (!start || props.disableNavigation || start.longPressTriggered) {
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
              data={data}
              extraData={flashListLayoutKey}
              renderItem={renderItem}
              horizontal={isHorizontalReading}
              pagingEnabled={isHorizontalReading}
              {...invertedProps}
              ref={flashListRef}
              keyExtractor={(_, index) => `${index}`}
              onViewableItemsChanged={isHorizontalReading ? undefined : onViewableItemsChanged}
              onMomentumScrollEnd={isHorizontalReading ? onListScrollSettled : undefined}
              onScrollEndDrag={
                isHorizontalReading && !isAndroidPdfMode && !isWeb ? onListScrollSettled : undefined
              }
              viewabilityConfig={{
                itemVisiblePercentThreshold: isWeb ? 95 : 100,
              }}
              estimatedItemSize={estimatedItemSize}
              estimatedListSize={{ width: listViewportWidth, height: dimension.height }}
              drawDistance={drawDistance}
              overrideItemLayout={
                !useFixedItemLayout
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
        currentPage={currentPage}
        variant="fix"
        facingPage={
          viewerHook.readingStyle === "facingPage" ||
          viewerHook.readingStyle === "facingPageWithTitle"
        }
        facingSecondPageExists={
          pages !== undefined &&
          (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType | undefined)?.page2 !==
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
      />
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  viewerGradient: {
    flex: 1,
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  scaleXInverted: {
    transform: [{ scaleX: -1 }],
  },
})
