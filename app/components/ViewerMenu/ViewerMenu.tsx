import { MessageKey } from "@/i18n"
import { BookReadingStyleType } from "@/type/types"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, Menu } from "native-base"
import React, { useState } from "react"
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
  const [pageDirectionState, setPageDirectionState] = useState(props.pageDirection)
  const [readingStyleState, setReadingStyleState] = useState(props.readingStyle)

  const onUpdateReadingStyle = (readingStyle: BookReadingStyleType) => {
    props.onSelectReadingStyle(readingStyle)
    setReadingStyleState(readingStyle)
  }

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
                <Text tx={`bookReadingStyle.${readingStyleState}` as MessageKey} fontSize={"12"} />
              </HStack>
            </Pressable>
          )
        }}
      >
        <MenuItem
          onPress={() => onUpdateReadingStyle("singlePage")}
          tx={"bookReadingStyle.singlePage"}
        />
        <MenuItem
          onPress={() => onUpdateReadingStyle("facingPage")}
          tx="bookReadingStyle.facingPage"
        />
        <MenuItem
          onPress={() => onUpdateReadingStyle("facingPageWithTitle")}
          tx="bookReadingStyle.facingPageWithTitle"
        />
        <MenuItem
          onPress={() => onUpdateReadingStyle("verticalScroll")}
          tx="bookReadingStyle.verticalScroll"
        />
      </Menu>
      {props.readingStyle !== "verticalScroll" ? (
        <Pressable
          onPress={() => {
            const direction = props.pageDirection === "left" ? "right" : "left"
            props.onSelectPageDirection(direction)
            setPageDirectionState(direction)
          }}
        >
          <HStack alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name={`arrow-${pageDirectionState}-bold`}
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
