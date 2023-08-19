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

  let page = (
    <PDF
      source={source}
      style={[styles.page, imageSize]}
      onLoadComplete={(numberOfPages, path, size) => {
        setTotalPages(numberOfPages)

        if (!imageSize) {
          let pdfHeight = size.height
          let pdfWidth = size.width

          if (size.height > windowDimension.height) {
            pdfWidth = (pdfWidth * size.height) / windowDimension.height
            pdfHeight = windowDimension.height
          }

          if (pdfWidth > windowDimension.width) {
            pdfWidth = windowDimension.width
          }
          setImageSize({ height: pdfHeight, width: pdfWidth })
        }
      }}
      onPageChanged={(page) => {
        console.log(page)
      }}
      horizontal={viewerHook.pageDirection !== "down"}
      trustAllCerts={false}
      enablePaging={true}
      page={isFacing ? pageNum : undefined}
    />
  )

  const onPageChange = (page) => {
    console.log(page)
    setPageNum(page)
  }
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
          <PagePressable
            currentPage={pageNum}
            direction="next"
            onPageChanging={onPageChange}
            onLongPress={viewerHook.onOpenMenu}
            onPageChanged={viewerHook.onCloseMenu}
            totalPages={totalPages}
            transitionPages={1}
            style={styles.page}
          >
            {page}
          </PagePressable>
        </PageSwiper>
      )
    } else {
      const page1 = page
      const page2 = (
        <PDF
          source={source}
          style={[styles.page, imageSize]}
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
          <HStack style={{ flex: 1 }}>
            <PagePressable
              currentPage={pageNum}
              direction={viewerHook.pageDirection === "left" ? "next" : "previous"}
              onPageChanging={onPageChange}
              onPageChanged={viewerHook.onCloseMenu}
              onLongPress={viewerHook.onOpenMenu}
              totalPages={totalPages}
              transitionPages={2}
              style={{ alignItems: "flex-end", flex: 1 }}
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
              style={{ alignItems: "flex-start", flex: 1 }}
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
