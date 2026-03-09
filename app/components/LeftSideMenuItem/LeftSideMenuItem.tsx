import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { logger } from "@/utils/logger"
import { Pressable } from "@gluestack-ui/themed"
import { Children, memo, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type LeftSideMenuItemProps = {
  name: string
  count: number
  children?: ReactNode
  mode?: "category" | "subCategory" | "node"
  depth?: number
  onLastNodePress?: () => void
  selected?: boolean
}
export const LeftSideMenuItem = memo(function LeftSideMenuItem({
  mode = "category",
  ...restProps
}: LeftSideMenuItemProps) {
  const props = { mode, ...restProps }
  const [isOpen, setIsOpen] = useState(false)
  const childCount = useMemo(() => Children.count(props.children), [props.children])

  const isParentNode = useMemo(
    () => (childCount > 0 && mode === "subCategory") || mode === "category",
    [childCount, mode],
  )

  const icon = useMemo(() => {
    if (isParentNode) {
      return isOpen ? "menu-down" : "menu-right"
    }
    return props.selected ? "check" : "bookshelf"
  }, [isParentNode, isOpen, props.selected])

  const handlePress = useMemo(
    () => () => {
      if (isParentNode) {
        setIsOpen(!isOpen)
      } else {
        logger.debug("LeftSideMenuItem leaf pressed", { name: props.name })
        props.onLastNodePress?.()
      }
    },
    [isParentNode, isOpen, props.name, props.onLastNodePress],
  )

  const paddingLeft = useMemo(() => {
    const depthValue = props.depth ?? 0
    if (depthValue === 0) return "$0"
    return `$${depthValue * 3}` as "$0" | "$3" | "$6" | "$9"
  }, [props.depth])

  return (
    <>
      <Pressable onPress={handlePress}>
        <HStack
          alignItems={"center"}
          marginHorizontal={"$0.5"}
          marginTop={"$0.5"}
          paddingLeft={paddingLeft}
        >
          <MaterialCommunityIcon name={icon} iconSize={"sm"} />
          <Text fontSize={"$md"}>{props.name}</Text>
          <Box flex={1} />
          <Text fontSize={"$md"}>{props.count}</Text>
        </HStack>
      </Pressable>
      {isOpen && props.children}
    </>
  )
})
