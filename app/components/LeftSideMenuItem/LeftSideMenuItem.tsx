import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { logger } from "@/utils/logger"
import { Pressable } from "@gluestack-ui/themed"
import { useState } from "react"

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
            logger.debug("LeftSideMenuItem leaf pressed", { name: props.name })
            props.onLastNodePress()
          }
        }}
      >
        <HStack
          alignItems={"center"}
          marginHorizontal={"$0.5"}
          marginTop={"$0.5"}
          paddingLeft={mode === "subCategory" ? "$0.5" : mode === "node" ? "$3" : undefined}
        >
          <MaterialCommunityIcon name={icon} iconSize={"sm"} />
          <Text fontSize={"$md"}>{props.name}</Text>
          <Box flex={1} />
          <Text fontSize={"$md"}>{props.count}</Text>
        </HStack>
      </Pressable>
      {isOpen ? props.children : null}
    </>
  )
}
