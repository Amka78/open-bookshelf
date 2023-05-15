import { useNavigation } from "@react-navigation/native"
import ExpoFastImage from "expo-fast-image"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect } from "react"
import { View } from "react-native"

import { FlatList, Flex, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { Entry } from "../../models/opds"
import { ApppNavigationProp } from "../../navigators"

export const CalibreRootScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const initialize = async () => {
    await calibreRootStore.initialize()
    /*navigation.setOptions({
      headerTitle(props) {
        return (
          <Flex direction="row" alignItems={"center"}>
            <ExpoFastImage
              source={{
                uri: `${settingStore.api.baseUrl}${opdsRootStore.root.icon}`,
              }}
              style={{ height: 30, width: 30 }}
              resizeMode={"cover"}
            />
            <Text color="white" paddingLeft={"2.5"} fontSize={"2xl"}>
              {opdsRootStore.root.title}
            </Text>
          </Flex>
        )
      },
    })*/
  }

  useEffect(() => {
    initialize()
  }, [])

  const renderItem = ({ item }: { item: string }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"lg"}>{item}</Text>
          </View>
        }
        onPress={() => {
          navigation.navigate("Acquisition", { link: item.link[0] })
        }}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<string> data={calibreRootStore.libraryMap.slice()} renderItem={renderItem} />
    </RootContainer>
  )
})
