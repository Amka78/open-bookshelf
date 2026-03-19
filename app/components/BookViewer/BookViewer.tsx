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
import { useNavigation } from "@react-navigation/native"
import { FlashList, type ListRenderItem } from "@shopify/flash-list"
import type React from "react"
import { useCallback, useEffect, useRef } from "react"
import {
  type FlexAlignType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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
  onLongPress?: () => void
}
export type BookViewerProps = {
  totalPage: number
  renderPage: (props: RenderPageProps) => React.ReactNode
  bookTitle: string
  onPageChange?: (page: number) => void
  onLastPage?: () => void
  initialPage?: number
  performanceMode?: "default" | "android-pdf"
}

export function BookViewer(props: BookViewerProps) {
  const palette = usePalette()
  const viewerHook = useViewer()
  const { settingStore } = useStores()

  const flashListRef = useRef<FlashListHandle>(null)

  const dimension = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const listViewportWidth = Math.max(1, dimension.width - insets.left - insets.right)

  const navigation = useNavigation<ApppNavigationProp>()
  const isWeb = Platform.OS === "web"
  const isAndroidPdfMode = props.performanceMode === "android-pdf" && Platform.OS === "android"
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
      const pageProps = {
        ...renderProps,
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
    [isHorizontalReading, pages, props.renderPage, scrollIndex, scrollToIndex, viewerHook],
  )

  const renderItem: ListRenderItem<number | FacingPageType> = useCallback(
    ({ item, index }) => {
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

  const estimatedItemSize =
    viewerHook.readingStyle === "verticalScroll" ? dimension.height : listViewportWidth
  const flashListLayoutKey = `${viewerHook.readingStyle}:${viewerHook.pageDirection}:${listViewportWidth}x${dimension.height}`
  const currentHorizontalLayoutKey =
    viewerHook.readingStyle === "verticalScroll" ? undefined : flashListLayoutKey
  const useFixedItemLayout = isHorizontalReading && !isWeb
  const windowSize = isAndroidPdfMode ? 2 : isWeb ? 5 : 3
  const maxToRenderPerBatch = isAndroidPdfMode ? 1 : 2
  const drawDistance = isAndroidPdfMode ? estimatedItemSize : undefined
  const webViewportStyle = isWeb
    ? ({ height: dimension.height, maxHeight: dimension.height } as const)
    : undefined
  const listContainerStyle = useTransformInvert ? styles.listInverted : styles.list
  const latestHorizontalIndexRef = useRef(scrollIndex)

  useEffect(() => {
    latestHorizontalIndexRef.current = scrollIndex
  }, [scrollIndex])

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
      />
      {pages ? (
        <Box
          style={[styles.viewerRoot, webViewportStyle]}
          alignSelf="center"
          width={listViewportWidth}
        >
          <Box style={listContainerStyle}>
            <FlashList<number | FacingPageType>
              key={flashListAxisKey}
              data={data}
              extraData={flashListLayoutKey}
              renderItem={renderItem}
              horizontal={isHorizontalReading}
              pagingEnabled={isHorizontalReading}
              inverted={isInverted && !useTransformInvert}
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
                      layout.size = estimatedItemSize
                      layout.offset = estimatedItemSize * index
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
        facintPage={
          viewerHook.readingStyle === "facingPage" ||
          viewerHook.readingStyle === "facingPageWithTitle"
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
  scaleXInverted: {
    transform: [{ scaleX: -1 }],
  },
})
