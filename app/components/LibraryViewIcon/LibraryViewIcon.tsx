import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, IconButton } from "native-base"
import React from "react"

export type LibraryViewIconProps = {
  onPress: () => void
  mode: "viewList" | "gridView"
}

export function LibraryViewIcon(props: LibraryViewIconProps) {
  return (
    <IconButton
      mb="4"
      variant="solid"
      bg="indigo.500"
      colorScheme="indigo"
      borderRadius="full"
      icon={
        <Icon
          as={MaterialCommunityIcons}
          size="6"
          name={props.mode === "viewList" ? "view-list" : "view-grid"}
          _dark={{
            color: "warmGray.50",
          }}
          color="warmGray.50"
        />
      }
      onPress={props.onPress}
    />
  )
}
