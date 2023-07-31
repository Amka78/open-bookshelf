import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import ExpoFastImage from "expo-fast-image"
import { observer } from "mobx-react-lite"
import { HStack, useBreakpointValue, Box, Slider, Text, VStack, IconButton } from "native-base"
import React, { FC, useEffect, useState } from "react"
import { Pressable, useWindowDimensions } from "react-native"
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler"

import { useStores } from "../../models"
import { ApppNavigationProp, AppStackParamList } from "../../navigators"
import { MaterialIcons } from "@expo/vector-icons"
import PageFlipper from "react-native-page-flipper"
import * as ScreenOrientation from "expo-screen-orientation"
import useOrientation from "../../hooks/useOrientation"
import { SwipeGestureHandler } from "../../components"

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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${route.params.library.metaData.title}`,
      headerShown: showMenu,
      headerRight: () => {
        return (
          <IconButton
            colorScheme="black"
            _icon={{
              as: MaterialIcons,
              name: "animation",
            }}
            onPress={() => {
              setUseAnimation(!useAnimation)
            }}
          />
        )
      },
    })
  }, [showMenu])

  const singlePage = (
    <SwipeGestureHandler
      onSwipeEnded={() => {
        setShowMenu(false)
      }}
      onLeftSwipe={() => {
        goToNextPage(pageNum, route.params.library.path.length, setPageNum, 1)
      }}
      onRightSwipe={() => {
        goToPreviousPage(pageNum, setPageNum, 1)
      }}
    >
      <Pressable
        onPress={() => {
          goToNextPage(pageNum, route.params.library.path.length, setPageNum, 1)
          setShowMenu(false)
        }}
        onLongPress={() => {
          setShowMenu(true)
        }}
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
      </Pressable>
    </SwipeGestureHandler>
  )

  const firstPage = (
    <Pressable
      onPress={(e) => {
        const nextPage = pageNum - 2

        setPageNum(nextPage > 0 ? nextPage : 0)
        setShowMenu(false)
      }}
      onLongPress={() => {
        setShowMenu(true)
      }}
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
    </Pressable>
  )

  const secondPage = (
    <Pressable
      onPress={(e) => {
        setPageNum(pageNum + 2)
        setShowMenu(false)
      }}
      onLongPress={() => {
        setShowMenu(true)
      }}
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
    </Pressable>
  )

  let fixedViewer = null

  if (
    pageNum === 0 ||
    !(
      isWidthScreen ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    )
  ) {
    fixedViewer = singlePage
  } else {
    fixedViewer = (
      <SwipeGestureHandler
        onLeftSwipe={() => {
          goToNextPage(pageNum, route.params.library.path.length, setPageNum, 2)
        }}
        onRightSwipe={() => {
          goToPreviousPage(pageNum, setPageNum, 2)
        }}
        onSwipeEnded={() => {
          setShowMenu(false)
        }}
      >
        <HStack>
          {secondPage}
          {firstPage}
        </HStack>
      </SwipeGestureHandler>
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

function goToPreviousPage(
  pageNum: number,
  setPageNum: React.Dispatch<React.SetStateAction<number>>,
  transitionPages: number,
) {
  if (pageNum > 0) {
    const currentPage = pageNum - transitionPages
    setPageNum(currentPage)
  }
}

function goToNextPage(
  pageNum: number,
  totalPage: number,
  setPageNum: React.Dispatch<React.SetStateAction<number>>,
  transitionPages: number,
) {
  if (pageNum < totalPage) {
    const currentPage = pageNum + transitionPages
    setPageNum(currentPage)
  }
}
