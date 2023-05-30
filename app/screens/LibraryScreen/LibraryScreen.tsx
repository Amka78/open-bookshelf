import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useBreakpointValue } from "native-base"
import React, { FC, useEffect } from "react"
import { useWindowDimensions } from "react-native"

import { BookDescriptionItem, BookImageItem, FlatList } from "../../components"
import { useStores } from "../../models"
import { Library } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"

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
    const onPress = async () => {
      await item.convertBook(() => {
        navigation.navigate("Viewer", { library: item })
      })
    }

    let listItem

    const imageUrl = `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`

    if (isWidthScreen) {
      listItem = <BookImageItem source={imageUrl} onPress={onPress} />
    } else {
      listItem = (
        <BookDescriptionItem
          source={imageUrl}
          onPress={onPress}
          authors={item.metaData.authors}
          title={item.metaData.title}
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
