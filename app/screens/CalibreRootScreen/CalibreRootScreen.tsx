import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect } from "react"
import { View } from "react-native"

import { FlatList, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { LibraryMap } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"

export const CalibreRootScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const initialize = async () => {
    await calibreRootStore.initialize()
  }

  useEffect(() => {
    initialize()
  }, [])

  const renderItem = ({ item }: { item: LibraryMap }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"lg"}>{item.id}</Text>
          </View>
        }
        onPress={() => {
          calibreRootStore.setSelectedLibraryId(item.id)
          navigation.navigate("Library")
        }}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<LibraryMap>
        data={calibreRootStore.libraryMap.slice()}
        renderItem={renderItem}
        estimatedItemSize={calibreRootStore.libraryMap?.length}
      />
    </RootContainer>
  )
})
