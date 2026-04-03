import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { usePalette } from "@/theme"
import { logger } from "@/utils/logger"
import { Pressable } from "@gluestack-ui/themed"
import { Children, useState } from "react"
import type { ReactNode } from "react"

export type LeftSideMenuItemProps = {
  name: string
  count: number
  children?: ReactNode
  mode?: "category" | "subCategory" | "node"
  depth?: number
  onLastNodePress?: () => void
  selected?: boolean
  operator?: "AND" | "OR"
  onOperatorToggle?: () => void
  calibreOperator?: string
  onCalibreOperatorToggle?: () => void
}
export function LeftSideMenuItem({
  mode = "category",
  ...restProps
}: LeftSideMenuItemProps) {
  const props = { mode, ...restProps }
  const palette = usePalette()
  const [isOpen, setIsOpen] = useState(false)
  const childCount = Children.count(props.children)

  const isParentNode = (childCount > 0 && mode === "subCategory") || mode === "category"

  const icon = (() => {
    if (isParentNode) {
      return isOpen ? "menu-down" : "menu-right"
    }
    return props.selected ? "check" : "bookshelf"
  })()

  const handlePress = () => {
    if (isParentNode) {
      setIsOpen(!isOpen)
    } else {
      logger.debug("LeftSideMenuItem leaf pressed", { name: props.name })
      props.onLastNodePress?.()
    }
  }

  const paddingLeft = (() => {
    const depthValue = props.depth ?? 0
    if (depthValue === 0) return "$0"
    return `$${depthValue * 3}` as "$0" | "$3" | "$6" | "$9"
  })()

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
          {props.onCalibreOperatorToggle && (
            <Pressable
              onPress={props.onCalibreOperatorToggle}
              marginRight={"$1"}
              paddingHorizontal={"$1"}
              paddingVertical={"$0.5"}
              backgroundColor={palette.surfaceStrong}
              borderRadius={"$sm"}
            >
              <Text fontSize={"$xs"} fontWeight="$bold" color={palette.textSecondary}>
                {props.calibreOperator ?? "="}
              </Text>
            </Pressable>
          )}
          <Text fontSize={"$md"}>{props.name}</Text>
          {props.selected && props.onOperatorToggle && (
            <Pressable
              onPress={props.onOperatorToggle}
              marginLeft={"$1"}
              paddingHorizontal={"$1"}
              paddingVertical={"$0.5"}
              backgroundColor={palette.surfaceStrong}
              borderRadius={"$sm"}
            >
              <Text fontSize={"$xs"} fontWeight="$bold" color={palette.accent}>
                {props.operator ?? "AND"}
              </Text>
            </Pressable>
          )}
          <Box flex={1} />
          <Text fontSize={"$md"}>{props.count}</Text>
        </HStack>
      </Pressable>
      {isOpen && props.children}
    </>
  )
}
