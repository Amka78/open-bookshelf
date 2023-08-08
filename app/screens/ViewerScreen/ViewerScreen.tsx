import { PagePressable, PageSwiper, ViewerMenu } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import { ClientSettingModel } from "@/models/CalibreRootStore"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { BookReadingStyleType } from "@/type/types"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import ExpoFastImage from "expo-fast-image"
import * as ScreenOrientation from "expo-screen-orientation"
import { observer } from "mobx-react-lite"
import { HStack, Slider, Text, useBreakpointValue, VStack } from "native-base"
import React, { FC, useEffect, useState } from "react"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export const ViewerScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const route = useRoute<ViewerScreenRouteProp>()

  const navigation = useNavigation<ApppNavigationProp>()

  const library = route.params.library
  const [pageNum, setPageNum] = useState(0)

  const [showMenu, setShowMenu] = useState(false)

  const orientation = useOrientation()

  const [useAnimation, setUseAnimation] = useState(true)
  const isWidthScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const selectedLibrary = calibreRootStore.getSelectedLibrary()

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
      headerShown: showMenu,
      headerRight: () => {
        return (
          <ViewerMenu
            clientSetting={tempClientSetting}
            onSelectReadingStyle={(readingStyle) => {
              setBookReadingStyle(readingStyle)
            }}
          />
        )
      },
    })
  }, [showMenu, tempClientSetting.pageDirection, tempClientSetting.readingStyle])

  const onOpenMenu = () => {
    setShowMenu(true)
  }
  const onCloseMenu = () => {
    setShowMenu(false)
  }

  const singlePage = (
    <PageSwiper
      currentPage={pageNum}
      onNextPageChanging={(nextPage) => {
        setPageNum(nextPage)
      }}
      onPreviousPageChanging={(previousPage) => {
        setPageNum(previousPage)
      }}
      onPageChanged={onCloseMenu}
      totalPages={route.params.library.path.length}
      transitionPage={1}
      pagingDirection={tempClientSetting.pageDirection}
    >
      <PagePressable
        currentPage={pageNum}
        direction="next"
        onLongPress={onOpenMenu}
        onPageChanged={onCloseMenu}
        onPageChanging={(page) => {
          setPageNum(page)
        }}
        totalPages={route.params.library.path.length}
        transitionPages={1}
      >
        <ExpoFastImage
          source={{
            uri: encodeURI(
              `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${library.path[pageNum]}?library_id=${calibreRootStore.selectedLibraryId}`,
            ),
          }}
          style={{ height: "100%" }}
          resizeMode={"contain"}
        />
      </PagePressable>
    </PageSwiper>
  )

  const firstPage = (
    <PagePressable
      currentPage={pageNum}
      direction="previous"
      onLongPress={onOpenMenu}
      onPageChanged={onCloseMenu}
      onPageChanging={(page) => {
        setPageNum(page)
      }}
      totalPages={route.params.library.path.length}
      transitionPages={2}
      style={{ alignItems: "flex-start", flex: 1 }}
    >
      <ExpoFastImage
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${library.path[pageNum]}?library_id=${calibreRootStore.selectedLibraryId}`,
          ),
        }}
        style={{ height: "100%", width: "70%" }}
        resizeMode={"cover"}
      />
    </PagePressable>
  )

  const secondPage = (
    <PagePressable
      currentPage={pageNum}
      direction="next"
      onLongPress={onOpenMenu}
      onPageChanged={onCloseMenu}
      onPageChanging={(page) => {
        setPageNum(page)
      }}
      totalPages={route.params.library.path.length}
      transitionPages={2}
      style={{ alignItems: "flex-end", flex: 1 }}
    >
      <ExpoFastImage
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${
              library.metaData.size
            }/${library.hash}/${library.path[pageNum + 1]}?library_id=${
              calibreRootStore.selectedLibraryId
            }`,
          ),
        }}
        style={{ height: "100%", width: "70%" }}
        resizeMode={"cover"}
      />
    </PagePressable>
  )

  let fixedViewer = null

  if (
    pageNum === 0 ||
    tempClientSetting.readingStyle === "singlePage" ||
    !(
      isWidthScreen ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    )
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
          setShowMenu(false)
        }}
        onPreviousPageChanging={(previousPage) => {
          setPageNum(previousPage)
        }}
        totalPages={route.params.library.path.length}
        transitionPage={2}
        pagingDirection={tempClientSetting.pageDirection}
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
          setPageNum(getSliderIndex(v, isWidthScreen))
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

  const animationViewer = {
    /* <PageFlipper
      data={library.path.map((value) => {
        return encodeURI(
          `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${value}?library_id=${calibreRootStore.selectedLibraryId}`,
        )
      })}
      pageSize={{
        height: 334, // the size of the images I plan to render (used simply to calculate ratio)
        width: 210,
      }}
      portrait={true}
      renderPage={(data) => (
        <ExpoFastImage source={{ uri: data }} style={{ height: "100%", width: "100%" }} />
      )}
    /> */
  }
  return (
    <>
      {/*useAnimation ? animationViewer :*/ fixedViewer}
      {showMenu ? footer : null}
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
