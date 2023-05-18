import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Box, useBreakpointValue } from "native-base"
import React, { FC, useEffect } from "react"

import { FlatList, Flex, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { Library } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"
import ExpoFastImage from "expo-fast-image"
import { StyleSheet, TouchableOpacity } from "react-native"

export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const isWidthScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const initialize = async () => {
    await calibreRootStore.searchtLibrary()
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle(props) {
        return (
          <Flex direction="row" alignItems={"center"}>
            <Text color="white" paddingLeft={"2.5"} fontSize={"2xl"}>
              {calibreRootStore.selectedLibraryId}
            </Text>
          </Flex>
        )
      },
    })
  }, [])

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
      console.log("press called")
      await item.convertBook()
      navigation.navigate("Viewer", { library: item })
    }

    let listItem

    if (isWidthScreen) {
      listItem = (
        <TouchableOpacity onPress={onPress}>
          <ExpoFastImage
            source={{
              uri: `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`,
            }}
            style={{ height: 400, width: 300 }}
            resizeMode={"cover"}
          />
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
      numColumns={isWidthScreen ? 7 : 1}
      onRefresh={
        isWidthScreen
          ? undefined
          : async () => {
              await initialize()
            }
      }
      onEndReached={async () => {
        console.log("onEndReached called")
        await calibreRootStore.searchMoreLibrary()
      }}
    />
  )
})

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
})
