import React, { useState } from "react"
import { Box, HStack, Icon, Pressable } from "native-base"
import { Text } from "../Text/Text"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export type LeftSideMenuItemProps = {
  name: string
  count: number
  children?: React.ReactNode[]
  mode?: "category" | "subCategory" | "node"
  onLastNodePress?: () => void
  selected?: boolean
}
export function LeftSideMenuItem({ mode = "category", ...restProps }: LeftSideMenuItemProps) {
  const props = { mode, ...restProps }
  const [isOpen, setIsOpen] = useState(false)

  const isParentNode = (props.children?.length > 0 && mode === "subCategory") || mode === "category"
  const icon = isParentNode
    ? isOpen
      ? "menu-down"
      : "menu-right"
    : props.selected
    ? "check"
    : "bookshelf"
  return (
    <>
      <Pressable
        onPress={() => {
          if (isParentNode) {
            setIsOpen(!isOpen)
          } else {
            console.log("called")
            props.onLastNodePress()
          }
        }}
      >
        <HStack
          alignItems={"center"}
          marginX={"0.3"}
          marginTop={"0.3"}
          paddingLeft={mode === "subCategory" ? "0.5" : mode === "node" ? "1" : undefined}
        >
          <Icon
            as={MaterialCommunityIcons}
            _dark={{
              color: "warmGray.50",
            }}
            size="6"
            name={icon}
            color="black.200"
          />
          <Text fontSize={"12"}>{props.name}</Text>
          <Box flex={"1"} />
          <Text fontSize={"12"}>{props.count}</Text>
        </HStack>
      </Pressable>
      {isOpen ? props.children : null}
    </>
  )
}
