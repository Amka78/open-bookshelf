import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import PDF from "react-native-pdf"

import { useStores } from "../../models"
import { AppStackParamList, ApppNavigationProp } from "../../navigators"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { HStack, Icon, IconButton, Menu, Pressable } from "native-base"
import { PagePressable, PageSwiper, Text } from "../../components"
import { translate } from "../../i18n"
import { ClientSettingModel } from "../../models/CalibreRootStore"
import { convertAbsoluteToRem } from "native-base/lib/typescript/theme/tools"

type PDFViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

type BookReadingStyleType = "singlePage" | "facingPage" | "facingPageWithTitle" | "verticalScroll"
export const PDFViewerScreen = observer(() => {
  const { settingStore, calibreRootStore } = useStores()
  const route = useRoute<PDFViewerScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()

  const [totalPages, setTotalPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [swiping, setSwiping] = useState(false)

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
          <HStack alignItems={"center"}>
            <Menu
              w="190"
              trigger={(triggerProps) => {
                return (
                  <Pressable {...triggerProps}>
                    <HStack alignItems={"center"}>
                      <Icon
                        as={MaterialCommunityIcons}
                        name={"book-settings"}
                        color={"black"}
                        _dark={{ color: "white" }}
                        size={"7"}
                      />
                      <Text
                        tx={`bookReadingStyle.${tempClientSetting.readingStyle}`}
                        fontSize={"12"}
                      />
                    </HStack>
                  </Pressable>
                )
              }}
            >
              <Menu.Item onPress={() => setBookReadingStyle("singlePage")}>
                {translate("bookReadingStyle.singlePage")}
              </Menu.Item>
              <Menu.Item onPress={() => setBookReadingStyle("facingPage")}>
                {translate("bookReadingStyle.facingPage")}
              </Menu.Item>
              <Menu.Item onPress={() => setBookReadingStyle("facingPageWithTitle")}>
                {translate("bookReadingStyle.facingPageWithTitle")}
              </Menu.Item>
              <Menu.Item onPress={() => setBookReadingStyle("verticalScroll")}>
                {translate("bookReadingStyle.verticalScroll")}
              </Menu.Item>
            </Menu>
            <Pressable
              onPress={() => {
                tempClientSetting.setProp(
                  "pageDirection",
                  tempClientSetting.pageDirection === "left" ? "right" : "left",
                )
              }}
            >
              <HStack alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name={`arrow-${tempClientSetting.pageDirection}-bold`}
                  color={"black"}
                  _dark={{ color: "white" }}
                  size={"7"}
                />
                <Text tx="pageDirection" fontSize={"12"} />
              </HStack>
            </Pressable>
          </HStack>
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
      style={styles.pdf}
      onLoadComplete={(numberOfPages) => {
        console.log("totalPage")
        console.log(totalPages)
        setTotalPages(numberOfPages)
      }}
      onPageChanged={(page) => {
        console.log(page)
        //setPageNum(page)
      }}
      horizontal={tempClientSetting.readingStyle !== "verticalScroll"}
      trustAllCerts={false}
      enablePaging={true}
      page={isFacing ? pageNum : undefined}
      fitPolicy={1}
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
        >
          <PagePressable
            currentPage={pageNum}
            direction="next"
            onPageChanging={onPageChange}
            totalPages={totalPages}
            transitionPages={1}
            style={{ flex: 1 }}
          >
            {page}
          </PagePressable>
        </PageSwiper>
      )
    } else {
      page = (
        <PageSwiper
          currentPage={pageNum}
          onNextPageChanging={onPageChange}
          onPreviousPageChanging={onPageChange}
          totalPages={totalPages}
          transitionPage={2}
          pagingDirection={tempClientSetting.pageDirection}
        >
          <HStack style={{ flex: 1 }}>
            <PagePressable
              currentPage={pageNum}
              direction={tempClientSetting.pageDirection === "left" ? "next" : "previous"}
              onPageChanging={onPageChange}
              totalPages={totalPages}
              transitionPages={2}
              style={{ flex: 1, alignItems: "flex-end" }}
            >
              {page}
            </PagePressable>
            <PagePressable
              currentPage={pageNum}
              direction={tempClientSetting.pageDirection === "left" ? "previous" : "next"}
              onPageChanging={onPageChange}
              totalPages={totalPages}
              transitionPages={2}
              style={{ flex: 1, alignItems: "flex-start" }}
            >
              <PDF
                source={source}
                style={styles.pdf}
                trustAllCerts={false}
                enablePaging={true}
                singlePage={true}
                page={pageNum + 1}
                fitPolicy={1}
              />
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
  pdf: {
    flex: 1,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width / 2.6,
  },
})
