import { Box, useBreakpointValue } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"
import { useWindowDimensions } from "react-native"

export type ContainerProps = ComponentProps<typeof Box>

export function RootContainer(props: ContainerProps) {
  const needOuter = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })
  const dim = useWindowDimensions()

  const Inner = (
    <Box
      {...props}
      backgroundColor={"white"}
      flex={needOuter ? 0.5 : 1}
      borderRadius={needOuter ? "$lg" : "$none"}
      $base-w={"$full"}
      $xl-w={"$96"}
      paddingHorizontal={"$2.5"}
      paddingVertical={"$3"}
      margin={"$0"}
    />
  )

  const comp = needOuter ? (
    <Box
      justifyContent={"center"}
      alignItems={"center"}
      alignSelf={"center"}
      flex={1}
      paddingHorizontal={"$0"}
    >
      {Inner}
    </Box>
  ) : (
    Inner
  )

  return comp
}
