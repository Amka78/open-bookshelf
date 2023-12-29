import { FlatList, ListItem, RootContainer, Text } from "@/components"
import { LibraryMap } from "@/models/CalibreRootStore"
import React from "react"
import { View } from "react-native"

export type CalibreRootScreenProps = {
  onLibraryPress: (id: string) => void
  libraries: LibraryMap[]
}
export function CalibreRootScreen(props: CalibreRootScreenProps) {
  const renderItem = ({ item }: { item: LibraryMap }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"lg"}>{item.id}</Text>
          </View>
        }
        onPress={() => props.onLibraryPress(item.id)}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<LibraryMap>
        data={props.libraries.slice()}
        renderItem={renderItem}
        estimatedItemSize={60}
      />
    </RootContainer>
  )
}
