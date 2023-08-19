import { BookPage, PageSwiper, ViewerMenu } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { useStores } from "@/models"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack, Slider, Text, VStack } from "native-base"
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
      pagingDirection={viewerHook.pageDirection}
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
    viewerHook.readingStyle === "singlePage"
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

  const footer = (
    <VStack
      position={"absolute"}
      left={0}
      right={0}
      bottom={0}
      height={"10%"}
      alignItems={"center"}
      justifyContent={"center"}
      backgroundColor={"white"}
    >
      <Slider
        w="3/4"
        maxW="900"
        $PWD
        defaultValue={pageNum * -1}
        minValue={-library.path.length}
        maxValue={0}
        step={1}
        onChange={(v) => {
          setPageNum(getSliderIndex(v, viewerHook.orientation === "horizontal"))
        }}
        isReversed={true}
      >
        <Slider.Track>
          <Slider.FilledTrack />
        </Slider.Track>
        <Slider.Thumb />
      </Slider>
      <Text textAlign="center">
        {pageNum}/{library.path.length}
      </Text>
    </VStack>
  )

  return (
    <>
      {fixedViewer}
      {viewerHook.showMenu ? footer : null}
    </>
  )
})
function getSliderIndex(v: number, isWidthScreen: boolean) {
  let pageNum = v * -1

  if (isWidthScreen && pageNum % 2 === 0) {
    pageNum--
  }
  return pageNum
}
