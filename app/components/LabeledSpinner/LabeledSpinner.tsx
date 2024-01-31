import { MessageKey } from "@/i18n"
import { Center, HStack, Spinner, VStack } from "@gluestack-ui/themed"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"

import { Heading } from "../Heading/Heading"

export type LabeledSpinnerProps = {
  label?: MessageKey
  labelDirection: "horizontal" | "vertical"
  containerStyle?: StyleProp<ViewStyle>
}

export function LabeledSpinner(props: LabeledSpinnerProps) {
  const spinner = <Spinner size="large" color="$coolGray500" />
  const label = <Heading color="primary.500" fontSize="$md" tx={props.label} />

  return props.labelDirection === "horizontal" ? (
    <HStack space={"sm"} alignItems={"center"}>
      {spinner}
      {label}
    </HStack>
  ) : (
    <Center style={props.containerStyle}>
      <VStack space={"sm"} justifyContent="center">
        {spinner}
        {label}
      </VStack>
    </Center>
  )
}
