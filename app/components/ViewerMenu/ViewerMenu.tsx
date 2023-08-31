import { MessageKey } from "@/i18n"
import { BookReadingStyleType } from "@/type/types"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, Menu } from "native-base"
import React from "react"
import { Pressable } from "react-native"

import { HStack } from "../HStack/HStack"
import { MenuItem } from "../MenuItem/MenuItem"
import { Text } from "../Text/Text"

export type ViewerMenuProps = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection) => void
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
                <Text tx={`bookReadingStyle.${props.readingStyle}` as MessageKey} fontSize={"12"} />
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
      {props.readingStyle !== "verticalScroll" ? (
        <Pressable
          onPress={() => {
            props.onSelectPageDirection(props.pageDirection === "left" ? "right" : "left")
          }}
        >
          <HStack alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name={`arrow-${props.pageDirection}-bold`}
              color={"black"}
              _dark={{ color: "white" }}
              size={"7"}
            />
            <Text tx="pageDirection" fontSize={"12"} />
          </HStack>
        </Pressable>
      ) : null}
    </HStack>
  )
}
