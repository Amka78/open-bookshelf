import { MessageKey, translate } from "@/i18n"
import { BookReadingStyleType } from "@/type/types"
import { Menu, MenuItem, MenuItemLabel as MenuItemLabelOrigin } from "@gluestack-ui/themed"
import React, { ComponentProps, useState } from "react"
import { Pressable } from "react-native"

import { Text, HStack, IconButton } from "@/components"

export type ViewerMenuProps = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection) => void
}

type MenuItemLabelProps = ComponentProps<typeof MenuItemLabelOrigin> & {
  tx: MessageKey
}
function MenuItemLabel(props: MenuItemLabelProps) {
  return (
    <MenuItemLabelOrigin {...props}>
      {props.tx ? translate(props.tx) : props.children}
    </MenuItemLabelOrigin>
  )
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
                <IconButton iconSize="md-" name="book-settings" />
                <Text tx={`bookReadingStyle.${readingStyleState}` as MessageKey} fontSize={"$md"} />
              </HStack>
            </Pressable>
          )
        }}
      >
        <MenuItem textValue="singlePage" onPress={() => onUpdateReadingStyle("singlePage")}>
          <MenuItemLabel tx={"bookReadingStyle.singlePage"} />
        </MenuItem>
        <MenuItem textValue="facingPage" onPress={() => onUpdateReadingStyle("facingPage")}>
          <MenuItemLabel tx="bookReadingStyle.facingPage" />
        </MenuItem>
        <MenuItem
          textValue="facingPageWithTitle"
          onPress={() => onUpdateReadingStyle("facingPageWithTitle")}
        >
          <MenuItemLabel tx="bookReadingStyle.facingPageWithTitle" />
        </MenuItem>
        <MenuItem
          textValue={"verticalScroll"}
          onPress={() => onUpdateReadingStyle("verticalScroll")}
        >
          <MenuItemLabel tx="bookReadingStyle.verticalScroll" />
        </MenuItem>
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
            <IconButton name={`arrow-${pageDirectionState}-bold`} iconSize={"md-"} />
            <Text tx="pageDirection" fontSize={"$md"} />
          </HStack>
        </Pressable>
      ) : null}
    </HStack>
  )
}
