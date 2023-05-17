import { RouteProp, useRoute } from "@react-navigation/native"
import ExpoFastImage from "expo-fast-image"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"

import { useStores } from "../../models"
import { AppStackParamList } from "../../navigators"
import { Pressable, View } from "react-native"
import { Box, HStack, Center, Image } from "native-base"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export const ViewerScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const route = useRoute<ViewerScreenRouteProp>()

  const library = route.params.library
  const [pageNum, setPageNum] = useState(0)

  const singlePage = (
    <Pressable
      onPress={() => {
        console.log("called")
        setPageNum(pageNum + 1)
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

  if (pageNum === 0) {
    viewer = singlePage
  } else {
    viewer = (
      <HStack space={2} justifyItems={"center"}>
        {secondPage}
        {firstPage}
      </HStack>
    )
  }
  return viewer
})
