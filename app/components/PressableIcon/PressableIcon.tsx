import { MessageKey } from "@/i18n"
import { Icon } from "native-base"
import React, { ComponentProps } from "react"
import { Pressable } from "react-native"

import { HStack } from "../HStack/HStack"
import { Text } from "../Text/Text"

export type PressableIconProps = ComponentProps<typeof Icon> & {
  onPress?: () => void
  tx?: MessageKey
  text?: string
}

export function PressableIcon(props: PressableIconProps) {
  let comp = (
    <Icon
      {...props}
      color={props.color ? props.color : "black"}
      _dark={props._dark ? props._dark : { color: "white" }}
      size={props.size ? props.size : "7"}
      onPress={undefined}
    />
  )

  if (props.tx || props.text) {
    comp = (
      <HStack alignItems="center">
        {comp}
        <Text tx={props.tx} fontSize={"12"}>
          {props.text}
        </Text>
      </HStack>
    )
  }
  return <Pressable onPress={props.onPress}>{comp}</Pressable>
}
