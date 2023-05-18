import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import ExpoFastImage from "expo-fast-image"
import { observer } from "mobx-react-lite"
import { HStack, useBreakpointValue, Box, Slider, Text, VStack } from "native-base"
import React, { FC, useEffect, useState } from "react"
import { Pressable } from "react-native"
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler"

import { useStores } from "../../models"
import { ApppNavigationProp, AppStackParamList } from "../../navigators"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export const ViewerScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const route = useRoute<ViewerScreenRouteProp>()

  const navigation = useNavigation<ApppNavigationProp>()

  const library = route.params.library
  const [pageNum, setPageNum] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">(null)

  const [showMenu, setShowMenu] = useState(false)
  const isWidthScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${route.params.library.metaData.title}`,
      headerShown: showMenu,
    })
  }, [showMenu])

  const singlePage = (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={(event) => {
          if (event.nativeEvent.translationX > 0) {
            setDirection("left")
          } else {
            setDirection("right")
          }
        }}
        onEnded={() => {
          if (direction === "left") {
            goToNextPage(pageNum, route.params.library.path.length, setPageNum)
          } else if (direction === "right") {
            if (pageNum > 0) {
              setPageNum(pageNum - 1)
            }
          }
          setShowMenu(false)
          setDirection(null)
        }}
      >
        <Pressable
          onPress={() => {
            goToNextPage(pageNum, route.params.library.path.length, setPageNum)
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
      </PanGestureHandler>
    </GestureHandlerRootView>

    /* </Pressable> */
  )

  const firstPage = (
    <Pressable
      onPress={() => {
        console.log("called")

        const nextPage = pageNum - 2

        setPageNum(nextPage > 0 ? nextPage : 0)
      }}
      style={{ alignItems: "flex-start", flex: 1 }}
    >
      <ExpoFastImage
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${library.metaData.size}/${library.hash}/${library.path[pageNum]}?library_id=${calibreRootStore.selectedLibraryId}`,
          ),
        }}
        style={{ height: "100%", width: 600 }}
        resizeMode={"contain"}
      />
    </Pressable>
  )

  const secondPage = (
    <Pressable
      onPress={() => {
        console.log("called")
        setPageNum(pageNum + 2)
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
        style={{ height: "100%", width: 600 }}
        resizeMode={"contain"}
      />
    </Pressable>
  )

  let viewer = null

  if (pageNum === 0 || !isWidthScreen) {
    viewer = singlePage
  } else {
    viewer = (
      <HStack space={2} justifyItems={"center"}>
        {secondPage}
        {firstPage}
      </HStack>
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
      backgroundColor={"white"}
    >
      <Slider
        w="3/4"
        maxW="300"
        defaultValue={pageNum}
        minValue={-library.path.length}
        maxValue={0}
        step={1}
        onChange={(v) => {
          setPageNum(v * -1)
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
      {viewer}
      {showMenu ? footer : null}
    </>
  )
})
function goToNextPage(
  pageNum: number,
  totalPage: number,
  setPageNum: React.Dispatch<React.SetStateAction<number>>,
) {
  if (pageNum < totalPage) setPageNum(pageNum + 1)
}
