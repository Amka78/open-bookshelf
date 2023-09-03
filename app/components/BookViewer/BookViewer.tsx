import { Box, HStack, PageManager, PagePressable, ViewerHeader } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { ApppNavigationProp } from "@/navigators"
import { BookReadingStyleType } from "@/type/types"
import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, useWindowDimensions } from "react-native"

type FacingPageType = { page1?: number; page2?: number }

type PageStyles = Record<BookReadingStyleType, number[] | FacingPageType[]>
export type RenderPageProps = {
  page: number
  direction: "next" | "previous"
  pageType: "singlePage" | "leftPage" | "rightPage"
}
export type BookViewerProps = {
  totalPage: number
  renderPage: (props: RenderPageProps) => React.ReactNode
  bookTitle: string
}

export function BookViewer(props: BookViewerProps) {
  const viewerHook = useViewer()

  const flastListRef = useRef<FlashList<number | FacingPageType>>()

  const dimension = useWindowDimensions()

  const [scrollIndex, setScrollToIndex] = useState(0)
  const [pages, setPages] = useState<PageStyles>()
  const navigation = useNavigation<ApppNavigationProp>()

  useEffect(() => {
    createData(props.totalPage)
  }, [])

  const renderPage = (renderProps: RenderPageProps) => {
    let alignItems

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
        currentPage={scrollIndex}
        direction={renderProps.direction}
        onLongPress={viewerHook.onOpenMenu}
        onPageChanged={viewerHook.onCloseMenu}
        onPageChanging={(page) => {
          console.tron.log(`page pressed next page:${page}`)
          setScrollToIndex(page)
          flastListRef.current.scrollToIndex({ index: page })
        }}
        totalPages={pages[viewerHook.readingStyle].length}
        transitionPages={1}
        style={{ ...styles.pageRoot, alignItems }}
      >
        {props.renderPage(renderProps)}
      </PagePressable>
    )
  }
  const renderItem = ({ item }: { item: number | FacingPageType }) => {
    let renderComp
    if (typeof item === "number" || (item as FacingPageType).page2 === undefined) {
      const num = typeof item === "number" ? item : (item as FacingPageType).page1
      renderComp = (
        <Box width={dimension.width} height={dimension.height}>
          {renderPage({
            page: num,
            direction: "next",
            pageType: "singlePage",
          })}
        </Box>
      )
    } else {
      const leftPage = renderPage({
        page: viewerHook.pageDirection === "left" ? item.page2 : item.page1,
        direction: viewerHook.pageDirection === "left" ? "next" : "previous",
        pageType: "leftPage",
      })
      const rightPage = renderPage({
        page: viewerHook.pageDirection === "left" ? item.page1 : item.page2,
        direction: viewerHook.pageDirection === "left" ? "previous" : "next",
        pageType: "rightPage",
      })
      renderComp = (
        <HStack width={dimension.width} height={dimension.height}>
          {leftPage}
          {rightPage}
        </HStack>
      )
    }

    return renderComp
  }

  let currentPage = 0

  if (scrollIndex !== 0) {
    if (viewerHook.readingStyle === "singlePage" || viewerHook.readingStyle === "verticalScroll") {
      currentPage = scrollIndex
    } else if (
      viewerHook.readingStyle === "facingPage" ||
      viewerHook.readingStyle === "facingPageWithTitle"
    ) {
      currentPage = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1
    }
  }

  return (
    <>
      <ViewerHeader
        headerTitle={props.bookTitle}
        visible={viewerHook.showMenu}
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
              flastListRef.current.scrollToIndex({ index })
            } else if (
              viewerHook.readingStyle === "facingPage" &&
              newReadingStyle === "facingPageWithTitle"
            ) {
              const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1

              const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
                return value.page1 === index || value.page2 === index
              })
              setScrollToIndex(newIndex)
              flastListRef.current.scrollToIndex({ index: newIndex })
            } else if (
              viewerHook.readingStyle === "facingPageWithTitle" &&
              newReadingStyle === "facingPage"
            ) {
              const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1

              const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
                return value.page1 === index || value.page2 == index
              })
              setScrollToIndex(newIndex)
              flastListRef.current.scrollToIndex({ index: newIndex })
            }
          } else {
            const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
              return value.page1 === scrollIndex || value.page2 == scrollIndex
            })
            setScrollToIndex(newIndex)
            flastListRef.current.scrollToIndex({ index: newIndex })
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
            data={pages[viewerHook.readingStyle].slice()}
            renderItem={renderItem}
            horizontal={viewerHook?.readingStyle !== "verticalScroll"}
            pagingEnabled={true}
            inverted={
              viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
            }
            ref={flastListRef}
            onViewableItemsChanged={(info) => {
              setScrollToIndex(info.changed[0].index)
              viewerHook.onCloseMenu()
            }}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 100,
            }}
            estimatedItemSize={1920}
          />
        </Box>
      ) : null}
      <PageManager
        currentPage={currentPage}
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
          flastListRef.current.scrollToIndex({ index })
        }}
        reverse={
          viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
        }
        visible={viewerHook.showMenu}
      />
    </>
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
  pageRoot: {
    flex: 1,
    zIndex: 0,
  },
  viewerRoot: {
    flex: 1,
  },
})
