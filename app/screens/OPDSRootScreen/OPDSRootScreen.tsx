import { Box, FlatList, ListItem, RootContainer, Text } from "@/components"
import { useODSRoot as useOpdsRoot } from "@/screens/OPDSRootScreen/useOPDSRoot"
import type { Entry } from "@/models/opds"
import type { ApppNavigationProp } from "@/navigators"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC } from "react"
import { View } from "react-native"

export const OPDSRootScreen: FC = observer(() => {
  
  const { entries, navigation } = useOpdsRoot()
  const palette = usePalette()

  const setupHeaderTitle = () => {
    return (
      <Box direction="row" alignItems={"center"}>
        <Image
          source={`${settingStore.api.baseUrl}${opdsRootStore.root.icon}`}
          style={{ height: 30, width: 30 }}
          resizeMode={"cover"}
        />
        <Text color={palette.textPrimary} paddingLeft={"2.5"} fontSize={"2xl"}>
          {opdsRootStore.root.title}
        </Text>
      </Box>
    )
  }

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
      <FlatList<Entry> data={entries} renderItem={renderItem} />
    </RootContainer>
  )
})
