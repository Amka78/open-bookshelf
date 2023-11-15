import React from "react"
import { Container as Template, IContainerProps, useBreakpointValue, Box } from "native-base"
import { useWindowDimensions, Platform } from "react-native"

export type ContainerProps = IContainerProps

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
      flex={{ base: "1", xl: "0.5" }}
      width={{ base: "full", xl: "lg" }}
      borderRadius={{ base: "none", xl: "lg" }}
      paddingX={"2.5"}
      paddingY={"3"}
      margin={"0"}
      style={{ minHeight: Platform.OS === "web" ? dim.height : undefined }}
    />
  )

  const comp = needOuter ? (
    <Template
      justifyContent={{ base: "flexStart", xl: "center" }}
      alignItems={{ base: "stretch", xl: "center" }}
      alignSelf={{ base: "none", xl: "center" }}
      flex={1}
      paddingX={"0"}
    >
      {Inner}
    </Template>
  ) : (
    Inner
  )

  return comp
}
