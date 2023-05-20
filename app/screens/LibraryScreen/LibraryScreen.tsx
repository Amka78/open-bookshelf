import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Box, useBreakpointValue } from "native-base"
import React, { FC, useEffect, useState } from "react"

import { FlatList, Flex, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { Library } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"
import ExpoFastImage from "expo-fast-image"
import { StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native"

export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const isWidthScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const search = async (searchQuery?: string) => {
    await calibreRootStore.searchtLibrary(searchQuery)
  }

  useEffect(() => {
    search()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: calibreRootStore.selectedLibraryId,
      headerSearchBarOptions: {
        hideWhenScrolling: true,
        onSearchButtonPress: (e) => {
          search(e.nativeEvent.text)
        },
      },
    })
  }, [])

  const window = useWindowDimensions()

  const renderItem = ({ item }: { item: Library }) => {
    console.log(item)
    let bottomText = ""

    item.metaData.authors.forEach((value) => {
      if (bottomText === "") {
        bottomText = value
      } else {
        bottomText += `,${value}`
      }
    })

    const onPress = async () => {
      await item.convertBook()
      navigation.navigate("Viewer", { library: item })
    }

    let listItem

    if (isWidthScreen) {
      listItem = (
        <TouchableOpacity onPress={onPress}>
          <Box marginX={"2"} marginTop={"2"}>
            <ExpoFastImage
              source={{
                uri: `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`,
              }}
              style={{ height: 320, width: 240 }}
              resizeMode={"stretch"}
            />
          </Box>
        </TouchableOpacity>
      )
    } else {
      listItem = (
        <ListItem
          LeftComponent={
            <Flex flexDirection={"row"} width={"full"}>
              <Flex flexDirection={"row"} width={"5/6"}>
                <ExpoFastImage
                  source={{
                    uri: `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`,
                  }}
                  style={styles.coverImage}
                  resizeMode={"contain"}
                />
                <Box marginLeft={"1"}>
                  <Text fontSize={"lg"} lineBreakMode="tail" numberOfLines={1}>
                    {item.metaData.title}
                  </Text>
                  <Text fontSize={"md"} marginTop={"0.5"}>
                    {bottomText}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          }
          onPress={onPress}
        />
      )
    }

    return listItem
  }

  return (
    <FlatList<Library>
      data={calibreRootStore.getSelectedLibrary()?.value.slice()}
      renderItem={renderItem}
      estimatedItemSize={calibreRootStore.getSelectedLibrary()?.value.length}
      numColumns={isWidthScreen ? Math.floor(window.width / 242) : 1}
      onRefresh={
        isWidthScreen
          ? undefined
          : async () => {
              await search()
            }
      }
      onEndReached={async () => {
        await calibreRootStore.searchMoreLibrary()
      }}
    />
  )
})

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
})
