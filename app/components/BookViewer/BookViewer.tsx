import { Box, PageManager, ViewerMenu, PagePressable } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { ApppNavigationProp } from "@/navigators"
import { BookReadingStyleType } from "@/type/types"
import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import { HStack } from "native-base"
import React, { useEffect, useRef, useState } from "react"
import { useWindowDimensions } from "react-native"

type FacingPageType = { page1?: number; page2?: number }
type FacingPageWithTitleType = FacingPageType & { cover?: number }

type PageStyles = Record<
  BookReadingStyleType,
  number[] | FacingPageType[] | FacingPageWithTitleType[]
>
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

  const flastListRef = useRef<FlashList<number | FacingPageType | FacingPageWithTitleType>>()

  const dimension = useWindowDimensions()

  const [scrollIndex, setScrollToIndex] = useState(0)
  const [pages, setPages] = useState<PageStyles>()
  const navigation = useNavigation<ApppNavigationProp>()
  useEffect(() => {
    createData(props.totalPage)
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${props.bookTitle}`,
      headerShown: viewerHook.showMenu,
      headerRight: () => {
        return (
          <ViewerMenu
            pageDirection={viewerHook.pageDirection}
            readingStyle={viewerHook.readingStyle}
            onSelectReadingStyle={(newReadingStyle) => {
              if (
                viewerHook.readingStyle === "facingPage" ||
                viewerHook.readingStyle === "facingPageWithTitle"
              ) {
                if (newReadingStyle === "singlePage" || newReadingStyle === "verticalScroll") {
                  const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType)
                    .page1
                  setScrollToIndex(index)
                  flastListRef.current.scrollToIndex({ index })
                } else if (
                  viewerHook.readingStyle === "facingPage" &&
                  newReadingStyle === "facingPageWithTitle"
                ) {
                  const index = (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType)
                    .page1

                  const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex(
                    (value) => {
                      return value.page1 === index || value.page2 === index
                    },
                  )
                  setScrollToIndex(newIndex)
                  flastListRef.current.scrollToIndex({ index: newIndex })
                } else if (
                  viewerHook.readingStyle === "facingPageWithTitle" &&
                  newReadingStyle === "facingPage"
                ) {
                  const index = (
                    pages[viewerHook.readingStyle][scrollIndex] as FacingPageWithTitleType
                  ).page1

                  const newIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex(
                    (value) => {
                      return value.page1 === index || value.page2 == index
                    },
                  )
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
        )
      },
    })
  }, [viewerHook.showMenu, viewerHook.pageDirection, viewerHook.readingStyle])

  const renderPage = (renderProps: RenderPageProps) => {
    const alignItems =
      renderProps.pageType === "singlePage"
        ? "center"
        : renderProps.pageType === "leftPage"
        ? "flex-end"
        : undefined
    return (
      <PagePressable
        currentPage={scrollIndex}
        direction={renderProps.direction}
        onLongPress={viewerHook.onOpenMenu}
        onPageChanged={viewerHook.onCloseMenu}
        onPageChanging={(page) => {
          setScrollToIndex(page)
          flastListRef.current.scrollToIndex({ index: page })
        }}
        totalPages={pages[viewerHook.readingStyle].length}
        transitionPages={1}
        style={{ flex: 1, alignItems }}
      >
        {props.renderPage(renderProps)}
      </PagePressable>
    )
  }
  const renderItem = ({ item }: { item: number | FacingPageType | FacingPageWithTitleType }) => {
    let renderComp
    if (typeof item === "number" || (item as FacingPageWithTitleType).cover !== undefined) {
      const num = typeof item === "number" ? item : (item as FacingPageWithTitleType).cover
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
      const firstPage = renderPage({
        page: item.page1,
        direction: "previous",
        pageType: "rightPage",
      })
      const secondPage = renderPage({
        page: item.page2,
        direction: "next",
        pageType: "leftPage",
      })
      renderComp = (
        <HStack width={dimension.width} height={dimension.height}>
          {secondPage}
          {firstPage}
        </HStack>
      )
    }

    return renderComp
  }

  return (
    <>
      {pages ? (
        <FlashList<number | FacingPageType | FacingPageWithTitleType>
          data={pages[viewerHook.readingStyle].slice()}
          renderItem={renderItem}
          horizontal={viewerHook?.readingStyle !== "verticalScroll"}
          pagingEnabled={true}
          inverted={
            viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
          }
          ref={flastListRef}
          style={{ flex: 1 }}
          onViewableItemsChanged={(info) => {
            setScrollToIndex(info.changed[0].index)
            viewerHook.onCloseMenu()
          }}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 100,
          }}
          estimatedItemSize={1920}
        />
      ) : null}
      {viewerHook.showMenu ? (
        <PageManager
          currentPage={
            viewerHook.readingStyle === "singlePage" || viewerHook.readingStyle === "verticalScroll"
              ? scrollIndex
              : (pages[viewerHook.readingStyle][scrollIndex] as FacingPageType).page1
          }
          totalPage={props.totalPage}
          onPageChange={(page) => {
            let index = page

            if (
              viewerHook.readingStyle === "facingPage" ||
              viewerHook.readingStyle === "facingPageWithTitle"
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
        />
      ) : null}
    </>
  )

  function createData(totalPage: number) {
    const singlePage: number[] = []
    const facingPage: FacingPageType[] = []
    const facingPageWithTitle: FacingPageWithTitleType[] = []
    for (let index = 0; index < totalPage; index++) {
      singlePage.push(index)

      if (index === 0) {
        facingPageWithTitle.push({ cover: index })
        facingPage.push({ page1: index, page2: index * 1 })
      } else if (index % 2 === 0) {
        facingPage.push({
          page1: index,
          page2: index + 1 < totalPage ? index + 1 : undefined,
        })
      } else {
        facingPageWithTitle.push({
          page1: index,
          page2: index + 1 < totalPage ? index + 1 : undefined,
        })
      }
    }

    const pageStyle: PageStyles = {
      singlePage,
      facingPage,
      facingPageWithTitle,
      verticalScroll: singlePage,
    }

    setPages(pageStyle)
  }
}
