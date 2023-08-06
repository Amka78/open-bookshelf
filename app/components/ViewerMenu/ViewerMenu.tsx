import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, Menu } from "native-base"
import React from "react"
import { Pressable } from "react-native"

import { ClientSetting } from "../../models/CalibreRootStore"
import { HStack } from "../HStack/HStack"
import { MenuItem } from "../MenuItem/MenuItem"
import { Text } from "../Text/Text"

export type readingStyle = "singlePage" | "facingPage" | "facingPageWithTitle" | "verticalScroll"
export type ViewerMenuProps = {
  clientSetting: ClientSetting
  onSelectReadingStyle: (readingStyle: readingStyle) => void
}
export function ViewerMenu(props: ViewerMenuProps) {
  return (
    <HStack>
      <Menu
        w="190"
        trigger={(triggerProps) => {
          return (
            <Pressable {...triggerProps}>
              <HStack alignItems={"center"}>
                <Icon
                  as={MaterialCommunityIcons}
                  name={"book-settings"}
                  color={"black"}
                  _dark={{ color: "white" }}
                  size={"7"}
                />
                <Text tx={`bookReadingStyle.${props.clientSetting.readingStyle}`} fontSize={"12"} />
              </HStack>
            </Pressable>
          )
        }}
      >
        <MenuItem
          onPress={() => props.onSelectReadingStyle("singlePage")}
          tx={"bookReadingStyle.singlePage"}
        />
        <MenuItem
          onPress={() => props.onSelectReadingStyle("facingPage")}
          tx="bookReadingStyle.facingPage"
        />
        <MenuItem
          onPress={() => props.onSelectReadingStyle("facingPageWithTitle")}
          tx="bookReadingStyle.facingPageWithTitle"
        />
        <MenuItem
          onPress={() => props.onSelectReadingStyle("verticalScroll")}
          tx="bookReadingStyle.verticalScroll"
        />
      </Menu>
      <Pressable
        onPress={() => {
          props.clientSetting.setProp(
            "pageDirection",
            props.clientSetting.pageDirection === "left" ? "right" : "left",
          )
        }}
      >
        <HStack alignItems="center">
          <Icon
            as={MaterialCommunityIcons}
            name={`arrow-${props.clientSetting.pageDirection}-bold`}
            color={"black"}
            _dark={{ color: "white" }}
            size={"7"}
          />
          <Text tx="pageDirection" fontSize={"12"} />
        </HStack>
      </Pressable>
    </HStack>
  )
}
