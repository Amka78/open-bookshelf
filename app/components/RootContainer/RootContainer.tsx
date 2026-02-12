import { GradientBackground } from "@/components"
import { usePalette } from "@/theme"
import { Box, useBreakpointValue } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"
import { StyleSheet } from "react-native"

export type ContainerProps = ComponentProps<typeof Box>

export function RootContainer(props: ContainerProps) {
  const palette = usePalette()
  const needOuter = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const { backgroundColor, borderColor, ...restProps } = props

  const Inner = (
    <Box
      {...restProps}
      backgroundColor={backgroundColor ?? palette.surface}
      borderColor={borderColor ?? palette.borderSubtle}
      borderWidth={needOuter ? 1 : 0}
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
    <GradientBackground
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Box
        justifyContent={"center"}
        alignItems={"center"}
        alignSelf={"center"}
        flex={1}
        paddingHorizontal={"$0"}
      >
        {Inner}
      </Box>
    </GradientBackground>
  ) : (
    <GradientBackground
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {Inner}
    </GradientBackground>
  )

  return comp
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
})
