import {
  Box,
  GradientBackground,
  HStack,
  PageManager,
  PagePressable,
  ViewerHeader,
} from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import type { BookReadingStyleType } from "@/type/types"
import { usePalette } from "@/theme"
import { goToNextPage } from "@/utils/pageTurnning"
import { useNavigation } from "@react-navigation/native"
import { FlashList, type ListRenderItem } from "@shopify/flash-list"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Platform, StyleSheet, type FlexAlignType, useWindowDimensions } from "react-native"

type FacingPageType = { page1?: number; page2?: number }

type PageStyles = Record<BookReadingStyleType, number[] | FacingPageType[]>
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

  const flashListRef = useRef<FlashList<number | FacingPageType>>(null)

  const dimension = useWindowDimensions()

  const [scrollIndex, setScrollToIndex] = useState(0)
  const [pages, setPages] = useState<PageStyles>()
  const [autoPageTurning, setAutoPageTurning] = useState(false)
  const [autoPageTurnIntervalMs, setAutoPageTurnIntervalMs] = useState(
    settingStore.autoPageTurnIntervalMs,
  )
  const initialPageAppliedRef = useRef(false)
  const lastPageNotifiedKeyRef = useRef<string>()
  const navigation = useNavigation<ApppNavigationProp>()
  const isWeb = Platform.OS === "web"

  const onAutoPageTurning = useCallback(() => {
    if (!pages) return
    const totalPages = pages[viewerHook.readingStyle].length
    if (totalPages <= 1) return

    setScrollToIndex((prevIndex) => {
      const nextIndex = goToNextPage(prevIndex, totalPages, 1)
      flashListRef.current?.scrollToIndex({ index: nextIndex })
      return nextIndex
    })
  }, [pages, viewerHook.readingStyle])

  useEffect(() => {
    if (!autoPageTurning) {
      return () => {}
    }

    const intervalId = setInterval(() => {
      onAutoPageTurning()
    }, autoPageTurnIntervalMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [autoPageTurning, autoPageTurnIntervalMs, onAutoPageTurning])

  useEffect(() => {
    createData(props.totalPage)
  }, [props.totalPage])

  useEffect(() => {
    initialPageAppliedRef.current = false
  }, [props.initialPage])

  useEffect(() => {
    if (!pages || props.initialPage === undefined || initialPageAppliedRef.current) {
      return
    }

    const clampedPage = Math.max(0, Math.min(props.initialPage, Math.max(props.totalPage - 1, 0)))

    let initialIndex = clampedPage
    if (
      viewerHook.readingStyle === "facingPage" ||
      viewerHook.readingStyle === "facingPageWithTitle"
    ) {
      const pageList = pages[viewerHook.readingStyle] as FacingPageType[]
      const foundIndex = pageList.findIndex((value) => {
        return value.page1 === clampedPage || value.page2 === clampedPage
      })
      initialIndex = foundIndex >= 0 ? foundIndex : 0
    }

    setScrollToIndex(initialIndex)
    requestAnimationFrame(() => {
      flashListRef.current?.scrollToIndex({ index: initialIndex, animated: false })
    })
    initialPageAppliedRef.current = true
  }, [pages, props.initialPage, props.totalPage, viewerHook.readingStyle])

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
            setScrollToIndex(page)
            flashListRef.current?.scrollToIndex({ index: page })
          }}
          totalPages={pages[viewerHook.readingStyle].length}
          transitionPages={1}
          style={{ ...styles.pageRoot, alignItems }}
        >
          {props.renderPage(renderProps)}
        </PagePressable>
      )
    },
    [pages, props.renderPage, scrollIndex, viewerHook],
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

  const data = useMemo(() => {
    if (!pages) return []
    return pages[viewerHook.readingStyle]
  }, [pages, viewerHook.readingStyle])

  const estimatedItemSize =
    viewerHook.readingStyle === "verticalScroll" ? dimension.height : dimension.width

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: { index?: number | null; isViewable?: boolean }[] }) => {
      const nextIndex = info.viewableItems
        .filter((item) => item.isViewable && item.index !== undefined && item.index !== null)
        .map((item) => item.index as number)
        .sort((a, b) => a - b)
        .pop()

      if (nextIndex === undefined || nextIndex === null) return
      setScrollToIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    },
  ).current

  const currentPage = useMemo(() => {
    if (!pages) return 0

    if (scrollIndex !== 0) {
      if (
        viewerHook.readingStyle === "singlePage" ||
        viewerHook.readingStyle === "verticalScroll"
      ) {
        return scrollIndex
      }
      if (
        viewerHook.readingStyle === "facingPage" ||
        viewerHook.readingStyle === "facingPageWithTitle"
      ) {
        return (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1 ?? 0
      }
    }

    return 0
  }, [pages, scrollIndex, viewerHook.readingStyle])

  useEffect(() => {
    props.onPageChange?.(currentPage)
  }, [currentPage, props.onPageChange])

  useEffect(() => {
    if (!pages) return

    const totalPageCount = pages[viewerHook.readingStyle].length
    if (totalPageCount <= 0) return

    if (scrollIndex >= totalPageCount - 1) {
      const lastPageKey = `${viewerHook.readingStyle}:${scrollIndex}:${totalPageCount}`
      if (lastPageNotifiedKeyRef.current === lastPageKey) {
        return
      }

      lastPageNotifiedKeyRef.current = lastPageKey
      props.onLastPage?.()
      return
    }

    lastPageNotifiedKeyRef.current = undefined
  }, [pages, props.onLastPage, scrollIndex, viewerHook.readingStyle])

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
          if (
            viewerHook.readingStyle === "facingPage" ||
            viewerHook.readingStyle === "facingPageWithTitle"
          ) {
            if (newReadingStyle === "singlePage" || newReadingStyle === "verticalScroll") {
              const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1
              setScrollToIndex(index)
              flashListRef.current?.scrollToIndex({ index })
            } else if (
              viewerHook.readingStyle === "facingPage" &&
              newReadingStyle === "facingPageWithTitle"
            ) {
              const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1

              const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
                return value.page1 === index || value.page2 === index
              })
              setScrollToIndex(newIndex)
              flashListRef.current?.scrollToIndex({ index: newIndex })
            } else if (
              viewerHook.readingStyle === "facingPageWithTitle" &&
              newReadingStyle === "facingPage"
            ) {
              const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1

              const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
                return value.page1 === index || value.page2 === index
              })
              setScrollToIndex(newIndex)
              flashListRef.current?.scrollToIndex({ index: newIndex })
            }
          } else {
            const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
              return value.page1 === scrollIndex || value.page2 === scrollIndex
            })
            setScrollToIndex(newIndex)
            flashListRef.current?.scrollToIndex({ index: newIndex })
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
          let index = page

          if (
            (viewerHook.readingStyle === "facingPage" ||
              viewerHook.readingStyle === "facingPageWithTitle") &&
            page !== 0
          ) {
            index = pages[viewerHook.readingStyle].findIndex((value: FacingPageType) => {
              return value.page1 === page || value.page2 === page
            })
          }
          setScrollToIndex(index)
          flashListRef.current?.scrollToIndex({ index })
        }}
        reverse={
          viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
        }
        visible={viewerHook.showMenu}
      />
    </GradientBackground>
  )

  function createData(totalPage: number) {
    const singlePage: number[] = []
    const facingPage: FacingPageType[] = []
    const facingPageWithTitle: FacingPageType[] = []
    for (let index = 0; index < totalPage; index++) {
      singlePage.push(index)

      if (index === 0) {
        facingPageWithTitle.push({ page1: index })
        facingPage.push({ page1: index, page2: index + 1 })
      } else if (index % 2 === 0) {
        if (index < totalPage) {
          facingPage.push({
            page1: index,
            page2: index + 1 < totalPage ? index + 1 : undefined,
          })
        }
      } else {
        if (index < totalPage) {
          facingPageWithTitle.push({
            page1: index,
            page2: index + 1 < totalPage ? index + 1 : undefined,
          })
        }
      }
    }

    const pageStyle: PageStyles = {
      singlePage,
      facingPage,
      facingPageWithTitle,
      verticalScroll: singlePage,
    }

    console.tron.log(pageStyle)

    setPages(pageStyle)
  }
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
