import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Box } from "native-base"
import React, { FC, useEffect } from "react"

import { FlatList, Flex, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { Library } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"
import ExpoFastImage from "expo-fast-image"
import { StyleSheet } from "react-native"

export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()

  const initialize = async () => {
    /*const childOPDS = opdsRootStore.children.find((value) => {
      return value.linkPath === route.params.link.href
    })*/

    /*if (childOPDS) {
      setCurrentOPDS(childOPDS.opds)
    } else {*/
    await calibreRootStore.initializeLibrary()
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

    return (
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
        onPress={async () => {
          await item.convertBook()
        }}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<Library>
        data={calibreRootStore.getSelectedLibrary()?.value.slice()}
        renderItem={renderItem}
        estimatedItemSize={calibreRootStore.getSelectedLibrary()?.value.length}
        onRefresh={async () => {
          await initialize()
        }}
        onEndReached={async () => {
          /* const link = currentOpds.link.find((value) => {
            return value.rel === "next"
          })

          if (link) {
            currentOpds.load(link.href, false)
          } */
        }}
      />
    </RootContainer>
  )
})

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
})
