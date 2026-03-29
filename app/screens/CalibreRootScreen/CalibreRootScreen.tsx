import { observer } from "mobx-react-lite"
import React, { type FC } from "react"
import { View } from "react-native"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"

import { FlatList, ListItem, RootContainer, Text } from "@/components"
import type { LibraryMap } from "@/models/calibre"
import { useCalibreRoot } from "./useCalibreRoot"

export const CalibreRootScreen: FC = observer(() => {
  const calibreRootHook = useCalibreRoot()
  const modal = useElectrobunModal()

  const renderItem = ({ item }: { item: LibraryMap }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"$lg"}>{item.id}</Text>
          </View>
        }
        onPress={() => calibreRootHook.onLibraryPress(item.id)}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<LibraryMap> data={calibreRootHook.library} renderItem={renderItem} />
    </RootContainer>
  )
})
