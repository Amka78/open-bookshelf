import { PageManager, PagePressable, PageSwiper, ViewerMenu } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { useStores } from "@/models"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack } from "native-base"
import React, { useEffect, useState } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import PDF from "react-native-pdf"

type PDFViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export const PDFViewerScreen = observer(() => {
  const { settingStore } = useStores()
  const route = useRoute<PDFViewerScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()

  const [totalPages, setTotalPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [imageSize, setImageSize] = useState(undefined)

  const windowDimension = useWindowDimensions()

  const source = {
    uri: `${settingStore.api.baseUrl}/get/PDF/${route.params.library.id}/config?content_disposition=inline`,
    cache: true,
  }

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

  const isFacing =
    viewerHook.readingStyle === "facingPage" || viewerHook.readingStyle === "facingPageWithTitle"

  const firstPdf = (
    <PDF
      source={source}
      style={[styles.page, { alignSelf: "center", justifyContent: "center" }, imageSize]}
      onLoadComplete={(numberOfPages, path, size) => {
        setTotalPages(numberOfPages)

        if (!imageSize) {
          console.log(size)
          console.log(windowDimension)
          let pdfHeight = size.height
          let pdfWidth = size.width

          if (size.height > windowDimension.height) {
            pdfWidth = pdfWidth * (windowDimension.height / size.height)
            pdfHeight = windowDimension.height
          }

          console.log(pdfWidth)
          if (pdfWidth > windowDimension.width) {
            pdfWidth = windowDimension.width
          } else if (
            viewerHook.readingStyle === "facingPage" ||
            viewerHook.readingStyle === "facingPageWithTitle"
          ) {
            if (pdfWidth > windowDimension.width / 2) pdfWidth = windowDimension.width / 2
          }
          setImageSize({ height: pdfHeight, width: pdfWidth })
        }
      }}
      onPageChanged={(page) => {
        console.log(page)
      }}
      horizontal={viewerHook.readingStyle !== "verticalScroll"}
      trustAllCerts={false}
      enablePaging={true}
      page={isFacing ? pageNum : undefined}
      enableRTL={viewerHook.pageDirection === "left"}
    />
  )

  const onPageChange = (page) => {
    console.log(page)
    setPageNum(page)
  }

  let page = (
    <PagePressable
      currentPage={pageNum}
      direction="next"
      onLongPress={viewerHook.onOpenMenu}
      onPageChanged={viewerHook.onCloseMenu}
      totalPages={totalPages}
      transitionPages={1}
      style={styles.page}
    >
      {firstPdf}
    </PagePressable>
  )
  if (isFacing) {
    if (pageNum === 1) {
      page = (
        <PageSwiper
          currentPage={pageNum}
          onNextPageChanging={onPageChange}
          onPreviousPageChanging={onPageChange}
          totalPages={totalPages}
          transitionPage={1}
          pagingDirection={viewerHook.pageDirection}
          style={styles.page}
        >
          {page}
        </PageSwiper>
      )
    } else {
      const page1 = firstPdf
      const page2 = (
        <PDF
          source={source}
          style={imageSize}
          trustAllCerts={false}
          enablePaging={true}
          singlePage={true}
          page={pageNum + 1}
        />
      )
      page = (
        <PageSwiper
          currentPage={pageNum}
          onNextPageChanging={onPageChange}
          onPreviousPageChanging={onPageChange}
          totalPages={totalPages}
          transitionPage={2}
          pagingDirection={viewerHook.pageDirection}
          style={{ alignItems: "center" }}
        >
          <HStack style={{ flex: 1, alignItems: "center" }}>
            <PagePressable
              currentPage={pageNum}
              direction={viewerHook.pageDirection === "left" ? "next" : "previous"}
              onPageChanging={onPageChange}
              onPageChanged={viewerHook.onCloseMenu}
              onLongPress={viewerHook.onOpenMenu}
              totalPages={totalPages}
              transitionPages={2}
              style={{ alignItems: "flex-end", height: "100%" }}
            >
              {viewerHook.pageDirection === "left" ? page2 : page1}
            </PagePressable>
            <PagePressable
              currentPage={pageNum}
              direction={viewerHook.pageDirection === "left" ? "previous" : "next"}
              onPageChanging={onPageChange}
              onPageChanged={viewerHook.onCloseMenu}
              onLongPress={viewerHook.onOpenMenu}
              totalPages={totalPages}
              transitionPages={2}
              style={{ alignItems: "flex-start", height: "100%" }}
            >
              {viewerHook.pageDirection === "left" ? page1 : page2}
            </PagePressable>
          </HStack>
        </PageSwiper>
      )
    }
  }
  return (
    <>
      <View style={styles.container}>{page}</View>
      {viewerHook.showMenu ? (
        <PageManager
          currentPage={pageNum}
          totalPage={totalPages}
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
})
