import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"
import { Box } from "native-base"
import { FlatList, Flex, Image, ListItem, RootContainer, Text, Icon } from "../../components"
import { useStores } from "../../models"
import { Entry } from "../../models/opds"
import { OpdsChildrenModel, OpdsModel, OpdsRoot } from "../../models/opds/OpdsRootStore"
import { ApppNavigationProp, AppStackParamList } from "../../navigators"
import { MaterialCommunityIcons } from "@expo/vector-icons"
type AcquisitionScreenRouteProp = RouteProp<AppStackParamList, "Acquisition">
export const AcquisitionScreen: FC = observer(() => {
  const { opdsRootStore, settingStore } = useStores()

  const route = useRoute<AcquisitionScreenRouteProp>()

  const navigation = useNavigation<ApppNavigationProp>()

  const [currentOpds, setCurrentOPDS] = useState<OpdsRoot>()

  const initialize = async () => {
    /*const childOPDS = opdsRootStore.children.find((value) => {
      return value.linkPath === route.params.link.href
    })*/

    /*if (childOPDS) {
      setCurrentOPDS(childOPDS.opds)
    } else {*/
    const linkOopds = OpdsModel.create()
    await linkOopds.load(route.params.link.href)

    console.log(linkOopds)

    setCurrentOPDS(linkOopds)
    const children = OpdsChildrenModel.create({
      linkPath: route.params.link.href,
      opds: linkOopds,
    })
    //opdsRootStore.add(children)
    //}
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle(props) {
        return (
          <Flex direction="row" alignItems={"center"}>
            <Image
              source={{
                uri: `${settingStore.api.baseUrl}${currentOpds?.icon}`,
              }}
              style={{ height: 30, width: 30 }}
              resizeMode={"cover"}
            />
            <Text color="white" paddingLeft={"2.5"} fontSize={"2xl"}>
              {currentOpds?.title}
            </Text>
          </Flex>
        )
      },
    })
  }, [currentOpds])

  const renderItem = ({ item }: { item: Entry }) => {
    console.log(item)
    const thumbnail = item.link.find((value) => {
      return value.rel === "http://opds-spec.org/image/thumbnail"
    })

    return (
      <ListItem
        LeftComponent={
          <>
            <Image
              source={{ uri: thumbnail && `${settingStore.api.baseUrl}${thumbnail.href}` }}
              style={{ height: 50, width: 30 }}
              resizeMode={"contain"}
            />
            <Box marginLeft={"1"}>
              <Text fontSize={"lg"} lineBreakMode="tail" numberOfLines={1}>
                {item.title}
              </Text>
              <Text fontSize={"md"} marginTop={"0.5"}>
                {item.author.length > 0 ? item.author[0]?.name : ""}
              </Text>
            </Box>
            <Icon as={MaterialCommunityIcons} name="arrow-down-thin-circle-outline" />
          </>
        }
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<Entry>
        data={currentOpds?.entry.slice()}
        renderItem={renderItem}
        estimatedItemSize={currentOpds?.entry.length}
        onRefresh={async () => {
          await initialize()
        }}
        onEndReached={async () => {
          const link = currentOpds.link.find((value) => {
            return value.rel === "next"
          })

          if (link) {
            currentOpds.load(link.href, false)
          }
        }}
      />
    </RootContainer>
  )
})
