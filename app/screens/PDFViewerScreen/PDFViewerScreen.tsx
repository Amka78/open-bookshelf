import { PagePressable, PageSwiper, ViewerMenu } from "@/components"
import { useStores } from "@/models"
import { ClientSettingModel } from "@/models/CalibreRootStore"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { BookReadingStyleType } from "@/type/types"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack } from "native-base"
import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import PDF from "react-native-pdf"

type PDFViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export const PDFViewerScreen = observer(() => {
  const { settingStore, calibreRootStore } = useStores()
  const route = useRoute<PDFViewerScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()

  const [totalPages, setTotalPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [imageSize, setImageSize] = useState(undefined)

  const selectedLibrary = calibreRootStore.getSelectedLibrary()
  const source = {
    uri: `${settingStore.api.baseUrl}/get/PDF/${route.params.library.id}/config?content_disposition=inline`,
    cache: true,
  }

  let tempClientSetting = selectedLibrary.clientSetting?.find((value) => {
    return value.id === route.params.library.id
  })

  if (!tempClientSetting) {
    tempClientSetting = ClientSettingModel.create({
      id: route.params.library.id,
      readingStyle: "singlePage",
      pageDirection: "left",
    })
  }

  const setBookReadingStyle = (style: BookReadingStyleType) => {
    tempClientSetting.setProp("readingStyle", style)
    const storedClientSetting = selectedLibrary.clientSetting.find((value) => {
      return value.id === route.params.library.id
    })

    if (!storedClientSetting) {
      const array = selectedLibrary.clientSetting.slice()

      array.push(tempClientSetting)
      selectedLibrary.setProp("clientSetting", array)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${route.params.library.metaData.title}`,
      headerRight: () => {
        return (
          <ViewerMenu
            clientSetting={tempClientSetting}
            onSelectReadingStyle={(readingStyle) => {
              console.log(readingStyle)
              setBookReadingStyle(readingStyle)
            }}
          />
        )
      },
    })
  }, [tempClientSetting.readingStyle, tempClientSetting.pageDirection])

  const isFacing =
    tempClientSetting.readingStyle === "facingPage" ||
    tempClientSetting.readingStyle === "facingPageWithTitle"

  let page = (
    <PDF
      source={source}
      style={[styles.page, imageSize]}
      onLoadComplete={(numberOfPages, path, size) => {
        setTotalPages(numberOfPages)

        if (!imageSize) {
          setImageSize({ height: size.height, width: size.width })
        }
      }}
      onPageChanged={(page) => {
        console.log(page)
        //setPageNum(page)
      }}
      horizontal={tempClientSetting.readingStyle !== "verticalScroll"}
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
          pagingDirection={tempClientSetting.pageDirection}
          style={styles.page}
        >
          <PagePressable
            currentPage={pageNum}
            direction="next"
            onPageChanging={onPageChange}
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
          pagingDirection={tempClientSetting.pageDirection}
          style={{ flex: 1, height: "100%", width: "100%" }}
        >
          <HStack style={{ flex: 1 }}>
            <PagePressable
              currentPage={pageNum}
              direction={tempClientSetting.pageDirection === "left" ? "next" : "previous"}
              onPageChanging={onPageChange}
              totalPages={totalPages}
              transitionPages={2}
              style={{ alignItems: "flex-end" }}
            >
              {tempClientSetting.pageDirection === "left" ? page2 : page1}
            </PagePressable>
            <PagePressable
              currentPage={pageNum}
              direction={tempClientSetting.pageDirection === "left" ? "previous" : "next"}
              onPageChanging={onPageChange}
              totalPages={totalPages}
              transitionPages={2}
              style={(styles.page, { alignItems: "flex-start" })}
            >
              {tempClientSetting.pageDirection === "left" ? page1 : page2}
            </PagePressable>
          </HStack>
        </PageSwiper>
      )
    }
  }
  return <View style={styles.container}>{page}</View>
})

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
})
