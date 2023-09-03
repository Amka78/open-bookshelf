import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"

import { HStack } from "../HStack/HStack"
import { PressableIcon } from "../PressableIcon/PressableIcon"
import { Text } from "../Text/Text"
import { ObservableViewerMenu, ViewerMenu, ViewerMenuProps } from "../ViewerMenu/ViewerMenu"

export type ViewerHeaderProps = ViewerMenuProps & {
  visible: boolean
  onLeftArrowPress?: () => void
  headerTitle: string
}

export function ViewerHeader(props: ViewerHeaderProps) {
  return props.visible ? (
    <HStack
      height={"50"}
      backgroundColor={"white"}
      position={"absolute"}
      top={0}
      left={0}
      right={0}
      zIndex={1}
    >
      <HStack flex={1} justifyContent={"flex-start"} marginLeft={"2"}>
        <PressableIcon
          as={MaterialCommunityIcons}
          name="arrow-left"
          onPress={props.onLeftArrowPress}
        />
        <Text marginLeft={"2"} fontSize={"lg"}>
          {props.headerTitle}
        </Text>
      </HStack>
      <HStack flex={1} justifyContent={"flex-end"} marginRight={"2"}>
        <ViewerMenu
          pageDirection={props.pageDirection}
          readingStyle={props.readingStyle}
          onSelectReadingStyle={props.onSelectReadingStyle}
          onSelectPageDirection={props.onSelectPageDirection}
        />
      </HStack>
    </HStack>
  ) : null
}
