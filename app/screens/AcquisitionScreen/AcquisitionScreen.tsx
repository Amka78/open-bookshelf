import { Box, FlatList, Icon, ListItem, RootContainer, Text } from "@/components"
import { useStores } from "@/models"
import { Entry } from "@/models/opds"
import { OpdsChildrenModel, OpdsModel, OpdsRoot } from "@/models/opds/OpdsRootStore"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { Image } from "expo-image"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"

type AcquisitionScreenRouteProp = RouteProp<AppStackParamList, "Acquisition">
export const AcquisitionScreen: FC = observer(() => {
  const { opdsRootStore, settingStore } = useStores()

  const route = useRoute<AcquisitionScreenRouteProp>()

  const navigation = useNavigation<ApppNavigationProp>()

  const [currentOpds, setCurrentOPDS] = useState<OpdsRoot>()

  const initialize = async () => {
    /* const childOPDS = opdsRootStore.children.find((value) => {
      return value.linkPath === route.params.link.href
    }) */

    /* if (childOPDS) {
      setCurrentOPDS(childOPDS.opds)
    } else { */
    const linkOopds = OpdsModel.create()
    await linkOopds.load(route.params.link.href)

    console.log(linkOopds)

    setCurrentOPDS(linkOopds)
    const children = OpdsChildrenModel.create({
      linkPath: route.params.link.href,
      opds: linkOopds,
    })
    // opdsRootStore.add(children)
    // }
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle(props) {
        return (
          <Box direction="row" alignItems={"center"}>
            <Image
              source={`${settingStore.api.baseUrl}${currentOpds?.icon}`}
              style={{ height: 30, width: 30 }}
              resizeMode={"cover"}
            />
            <Text color="white" paddingLeft={"2.5"} fontSize={"2xl"}>
              {currentOpds?.title}
            </Text>
          </Box>
        )
      },
    })
  }, [currentOpds])

  const renderItem = ({ item }: { item: Entry }) => {
    console.log(item)
    const thumbnail = item.link.find((value) => {
      return value.rel === "http://opds-spec.org/image/thumbnail"
    })

    let bottomText = ""

    if (item.contentType === "text") {
      bottomText = item.content
    } else {
      item.author.forEach((value) => {
        if (bottomText === "") {
          bottomText = value.name
        } else {
          bottomText += `,${value.name}`
        }
      })
    }

    return (
      <ListItem
        LeftComponent={
          <Box flexDirection={"row"} width={"full"}>
            <Box flexDirection={"row"} width={"5/6"}>
              {item.contentType !== "text" && (
                <ExpoFastImage
                  source={{ uri: thumbnail && `${settingStore.api.baseUrl}${thumbnail.href}` }}
                  style={{ height: 50, width: 30 }}
                  resizeMode={"contain"}
                />
              )}
              <Box marginLeft={"1"}>
                <Text fontSize={"lg"} lineBreakMode="tail" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text fontSize={"md"} marginTop={"0.5"}>
                  {bottomText}
                </Text>
              </Box>
            </Box>
            {item.contentType !== "text" && (
              <Icon
                as={MaterialCommunityIcons}
                name="arrow-down-thin-circle-outline"
                size={"lg"}
                position={"absolute"}
                top={"1.5"}
                right={"0.5"}
              />
            )}
          </Box>
        }
        onPress={() => {
          if (item.contentType === "text") {
            navigation.push("Acquisition", { link: item.link[0] })
          }
        }}
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
