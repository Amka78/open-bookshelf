import { BookPage, PageManager, PageSwiper, ViewerMenu } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { useStores } from "@/models"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack } from "native-base"
import React, { FC, useEffect, useState } from "react"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export const ViewerScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const route = useRoute<ViewerScreenRouteProp>()

  const navigation = useNavigation<ApppNavigationProp>()

  const library = route.params.library
  const [pageNum, setPageNum] = useState(0)

  const viewerHook = useViewer()

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${route.params.library.metaData.title}`,
      headerShown: viewerHook.showMenu,
      headerRight: () => {
        return (
          <ViewerMenu
            pageDirection={viewerHook.pageDirection}
            readingStyle={viewerHook.readingStyle}
            onSelectReadingStyle={(readingStyle) => {
              viewerHook.onSetBookReadingStyle(readingStyle)
            }}
            onSelectPageDirection={(pageDirection) => {
              viewerHook.onSetPageDirection(pageDirection)
            }}
          />
        )
      },
    })
  }, [viewerHook.showMenu, viewerHook.pageDirection, viewerHook.readingStyle])

  const singlePage = (
    <PageSwiper
      currentPage={pageNum}
      onNextPageChanging={(nextPage) => {
        setPageNum(nextPage)
      }}
      onPreviousPageChanging={(previousPage) => {
        setPageNum(previousPage)
      }}
      onPageChanged={viewerHook.onCloseMenu}
      totalPages={route.params.library.path.length}
      transitionPage={1}
      pagingDirection={
        viewerHook.readingStyle === "verticalScroll" ? "down" : viewerHook.pageDirection
      }
    >
      <BookPage
        currentPage={pageNum}
        direction="next"
        onLongPress={viewerHook.onOpenMenu}
        onPageChanged={viewerHook.onCloseMenu}
        onPageChanging={(page) => {
          setPageNum(page)
        }}
        totalPages={route.params.library.path.length}
        transitionPages={1}
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${library.path[pageNum]}?library_id=${calibreRootStore.selectedLibraryId}`,
          ),
        }}
        pageType="singlePage"
      />
    </PageSwiper>
  )

  const firstPage = (
    <BookPage
      currentPage={pageNum}
      direction="previous"
      onLongPress={viewerHook.onOpenMenu}
      onPageChanged={viewerHook.onCloseMenu}
      onPageChanging={(page) => {
        setPageNum(page)
      }}
      totalPages={route.params.library.path.length}
      transitionPages={2}
      source={{
        uri: encodeURI(
          `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${library.path[pageNum]}?library_id=${calibreRootStore.selectedLibraryId}`,
        ),
      }}
      pageType="rightPage"
    />
  )
  const secondPage = (
    <BookPage
      currentPage={pageNum}
      direction="next"
      onLongPress={viewerHook.onOpenMenu}
      onPageChanged={viewerHook.onCloseMenu}
      onPageChanging={(page) => {
        setPageNum(page)
      }}
      totalPages={route.params.library.path.length}
      transitionPages={2}
      source={{
        uri: encodeURI(
          `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${
            library.metaData.size
          }/${library.hash}/${library.path[pageNum + 1]}?library_id=${
            calibreRootStore.selectedLibraryId
          }`,
        ),
      }}
      pageType="leftPage"
    />
  )

  let fixedViewer = null

  if (
    (pageNum === 0 && viewerHook.readingStyle !== "facingPage") ||
    (viewerHook.orientation === "vertical" && viewerHook.readingStyle !== "facingPage") ||
    viewerHook.readingStyle === "singlePage" ||
    viewerHook.readingStyle === "verticalScroll"
  ) {
    fixedViewer = singlePage
  } else {
    fixedViewer = (
      <PageSwiper
        currentPage={pageNum}
        onNextPageChanging={(nextPage) => {
          setPageNum(nextPage)
        }}
        onPageChanged={() => {
          viewerHook.onCloseMenu()
        }}
        onPreviousPageChanging={(previousPage) => {
          setPageNum(previousPage)
        }}
        totalPages={route.params.library.path.length}
        transitionPage={2}
        pagingDirection={viewerHook.pageDirection}
      >
        <HStack>
          {secondPage}
          {firstPage}
        </HStack>
      </PageSwiper>
    )
  }

  return (
    <>
      {fixedViewer}
      {viewerHook.showMenu ? (
        <PageManager
          currentPage={pageNum}
          totalPage={library.path.length}
          facing={
            viewerHook.readingStyle === "facingPage" ||
            viewerHook.readingStyle === "facingPageWithTitle"
          }
          onPageChange={(page) => {
            setPageNum(page)
          }}
          reverse={viewerHook.pageDirection === "left"}
        />
      ) : null}
    </>
  )
})
