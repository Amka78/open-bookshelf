import {
  Box,
  GradientBackground,
  HStack,
  PageManager,
  PagePressable,
  ViewerHeader,
} from "@/components"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { FlashList, type ListRenderItem } from "@shopify/flash-list"
import type React from "react"
import { useCallback, useRef } from "react"
import { type FlexAlignType, Platform, StyleSheet, useWindowDimensions } from "react-native"
import { type FacingPageType, type FlashListHandle, useBookViewerState } from "./useBookViewerState"

export type RenderPageProps = {
  page: number
  direction: "next" | "previous"
  pageType: "singlePage" | "leftPage" | "rightPage"
  scrollIndex: number
}
export type BookViewerProps = {
  totalPage: number
  renderPage: (props: RenderPageProps) => React.ReactNode
  bookTitle: string
  onPageChange?: (page: number) => void
  onLastPage?: () => void
  initialPage?: number
}

export function BookViewer(props: BookViewerProps) {
  const palette = usePalette()
  const viewerHook = useViewer()
  const { settingStore } = useStores()

  const flashListRef = useRef<FlashListHandle>(null)

  const dimension = useWindowDimensions()

  const navigation = useNavigation<ApppNavigationProp>()
  const isWeb = Platform.OS === "web"
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
            scrollToIndex(page)
          }}
          totalPages={pages[viewerHook.readingStyle].length}
          transitionPages={1}
          style={{ ...styles.pageRoot, alignItems }}
        >
          {props.renderPage(renderProps)}
        </PagePressable>
      )
    },
    [pages, props.renderPage, scrollIndex, scrollToIndex, viewerHook],
  )

  const renderItem: ListRenderItem<number | FacingPageType> = useCallback(
    ({ item, index }) => {
      let renderComp: React.JSX.Element
      if (typeof item === "number" || (item as FacingPageType).page2 === undefined) {
        const num = typeof item === "number" ? item : (item as FacingPageType).page1
        renderComp = (
          <Box width={dimension.width} height={dimension.height}>
            {renderPage({
              page: num,
              direction: "next",
              pageType: "singlePage",
              scrollIndex: index,
            })}
          </Box>
        )
      } else {
        const leftPage = renderPage({
          page: viewerHook.pageDirection === "left" ? item.page2 : item.page1,
          direction: viewerHook.pageDirection === "left" ? "next" : "previous",
          pageType: "leftPage",
          scrollIndex: index,
        })
        const rightPage = renderPage({
          page: viewerHook.pageDirection === "left" ? item.page1 : item.page2,
          direction: viewerHook.pageDirection === "left" ? "previous" : "next",
          pageType: "rightPage",
          scrollIndex: index,
        })
        renderComp = (
          <HStack width={dimension.width} height={dimension.height}>
            {leftPage}
            {rightPage}
          </HStack>
        )
      }

      return renderComp
    },
    [dimension.height, dimension.width, renderPage, viewerHook.pageDirection],
  )

  const estimatedItemSize =
    viewerHook.readingStyle === "verticalScroll" ? dimension.height : dimension.width

  return (
    <GradientBackground
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.viewerGradient}
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
            scrollToIndex(nextIndex)
          }
          viewerHook.onSetBookReadingStyle(newReadingStyle)
        }}
        onSelectPageDirection={(pageDirection) => {
          viewerHook.onSetPageDirection(pageDirection)
        }}
      />
      {pages ? (
        <Box style={styles.viewerRoot}>
          <FlashList<number | FacingPageType>
            data={data}
            renderItem={renderItem}
            horizontal={viewerHook?.readingStyle !== "verticalScroll"}
            pagingEnabled={true}
            inverted={
              viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
            }
            ref={flashListRef}
            keyExtractor={(_, index) => `${index}`}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: isWeb ? 95 : 100,
            }}
            estimatedItemSize={estimatedItemSize}
            estimatedListSize={{ width: dimension.width, height: dimension.height }}
            overrideItemLayout={
              isWeb
                ? undefined
                : (layout, _, index) => {
                    layout.size = estimatedItemSize
                    layout.offset = estimatedItemSize * index
                  }
            }
            removeClippedSubviews={!isWeb}
            windowSize={isWeb ? 5 : 3}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
          />
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
          scrollToIndex(index)
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
    zIndex: 0,
  },
  viewerRoot: {
    flex: 1,
  },
})
