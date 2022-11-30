import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect } from "react"
import { View } from "react-native"

import { FlatList, Flex, Image, ListItem, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { Entry } from "../../models/opds"
import { ApppNavigationProp } from "../../navigators"

export const OPDSRootScreen: FC = observer(() => {
  const { opdsRootStore, settingStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const initialize = async () => {
    await opdsRootStore.root.load(settingStore.api.initialPath)
    navigation.setOptions({
      headerTitle(props) {
        return (
          <Flex direction="row" alignItems={"center"}>
            <Image
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
    })
  }

  useEffect(() => {
    initialize()
  }, [])

  const renderItem = ({ item }: { item: Entry }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"lg"}>{item.title}</Text>
            <Text fontSize={"md"} marginTop={"0.5"}>
              {item.content}
            </Text>
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
      <FlatList<Entry> data={opdsRootStore.root?.entry.slice()} renderItem={renderItem} />
    </RootContainer>
  )
})
