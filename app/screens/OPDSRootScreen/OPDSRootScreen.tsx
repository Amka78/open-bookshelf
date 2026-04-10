import { FlatList, ListItem, RootContainer, Text } from "@/components"
import type { Entry } from "@/models/opds"
import { useODSRoot as useOpdsRoot } from "@/screens/OPDSRootScreen/useOPDSRoot"
import { observer } from "mobx-react-lite"
import React, { type FC, useCallback } from "react"
import { View } from "react-native"

export const OPDSRootScreen: FC = observer(() => {
  const { entries, navigation } = useOpdsRoot()

  const renderItem = useCallback(
    ({ item }: { item: Entry }) => {
      return (
        <ListItem
          LeftComponent={
            <View>
              <Text fontSize={"$lg"}>{item.title}</Text>
              <Text fontSize={"$md"} marginTop={"$0.5"}>
                {item.content}
              </Text>
            </View>
          }
          onPress={() => {
            navigation.navigate("Acquisition", { link: item.link[0] })
          }}
        />
      )
    },
    [navigation],
  )

  return (
    <RootContainer>
      <FlatList<Entry> data={entries} renderItem={renderItem} />
    </RootContainer>
  )
})
