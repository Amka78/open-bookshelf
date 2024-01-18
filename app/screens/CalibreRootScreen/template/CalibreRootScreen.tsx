import { FlatList, ListItem, RootContainer, Text } from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { LibraryMap } from "@/models/CalibreRootStore"
import React, { useLayoutEffect } from "react"
import { View } from "react-native"
import { modalfy, useModal } from "react-native-modalfy"

export type CalibreRootScreenProps = {
  initialize: () => Promise<void>
  onLibraryPress: (id: string) => void
  libraries: LibraryMap[]
}
export function CalibreRootScreen(props: CalibreRootScreenProps) {
  const modal = useModal<ModalStackParams>()

  const initialize = async () => {
    await props.initialize()
  }

  useLayoutEffect(() => {
    initialize()
  }, [initialize])

  const renderItem = ({ item }: { item: LibraryMap }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"$lg"}>{item.id}</Text>
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
