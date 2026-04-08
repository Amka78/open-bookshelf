import { Box, FlatList, ListItem, MaterialCommunityIcon, RootContainer, Text } from "@/components"
import { useStores } from "@/models"
import type { Entry } from "@/models/opds"
import { OpdsModel, type OpdsRoot } from "@/models/opds/OpdsRootStore"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { usePalette } from "@/theme"
import { logger } from "@/utils/logger"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { Image } from "expo-image"
import { observer } from "mobx-react-lite"
import React, { type FC, useEffect, useState } from "react"

type AcquisitionScreenRouteProp = RouteProp<AppStackParamList, "Acquisition">

async function loadOpdsFromLink(href: string) {
  const linkOopds = OpdsModel.create()
  await linkOopds.load(href)
  logger.debug("OPDS loaded", linkOopds)
  return linkOopds
}

export const AcquisitionScreen: FC = observer(() => {
  const { settingStore } = useStores()
  const palette = usePalette()

  const route = useRoute<AcquisitionScreenRouteProp>()
  const linkHref = route.params.link.href

  const navigation = useNavigation<ApppNavigationProp>()

  const [currentOpds, setCurrentOPDS] = useState<OpdsRoot>()

  useEffect(() => {
    let canceled = false
    void (async () => {
      /* const childOPDS = opdsRootStore.children.find((value) => {
        return value.linkPath === linkHref
      }) */

      /* if (childOPDS) {
        setCurrentOPDS(childOPDS.opds)
      } else { */
      const linkOopds = await loadOpdsFromLink(linkHref)
      if (canceled) return

      setCurrentOPDS(linkOopds)
      // opdsRootStore.add(children)
      // }
    })()

    return () => {
      canceled = true
    }
  }, [linkHref])

  useEffect(() => {
    navigation.setOptions({
      headerTitle(props) {
        return (
          <Box flexDirection="row" alignItems={"center"}>
            <Image
              source={`${settingStore.api.baseUrl}${currentOpds?.icon}`}
              style={{ height: 30, width: 30 }}
              resizeMode={"cover"}
            />
            <Text color={palette.textPrimary} paddingLeft={"$2.5"} fontSize={"$2xl"}>
              {currentOpds?.title}
            </Text>
          </Box>
        )
      },
    })
  }, [currentOpds, navigation, palette.textPrimary, settingStore.api.baseUrl])

  const renderItem = ({ item }: { item: Entry }) => {
    logger.debug("OPDS entry", item)
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
          <Box flexDirection={"row"} width={"$full"}>
            <Box flexDirection={"row"} width={"$5/6"}>
              {item.contentType !== "text" && (
                <Image
                  source={{ uri: thumbnail && `${settingStore.api.baseUrl}${thumbnail.href}` }}
                  style={{ height: 50, width: 30 }}
                  resizeMode={"contain"}
                />
              )}
              <Box marginLeft={"$1"}>
                <Text fontSize={"$lg"} lineBreakMode="tail" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text fontSize={"$md"} marginTop={"$0.5"}>
                  {bottomText}
                </Text>
              </Box>
            </Box>
            {item.contentType !== "text" && (
              <MaterialCommunityIcon
                name="arrow-down-thin-circle-outline"
                position={"absolute"}
                top={"$1.5"}
                right={"$0.5"}
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
        onRefresh={async () => {
          const linkOopds = await loadOpdsFromLink(linkHref)
          setCurrentOPDS(linkOopds)
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
