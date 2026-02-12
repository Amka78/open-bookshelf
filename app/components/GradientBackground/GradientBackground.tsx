import type { ReactNode } from "react"
import { Platform, StyleSheet, View, type ViewStyle } from "react-native"

export type GradientBackgroundProps = {
  colors: string[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  style?: ViewStyle | ViewStyle[]
  children?: ReactNode
}

export function GradientBackground({
  colors,
  start,
  end,
  style,
  children,
}: GradientBackgroundProps) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.webFallback, { backgroundColor: colors[0] ?? "transparent" }, style]}>
        {children}
      </View>
    )
  }

  const LinearGradient =
    require("react-native-linear-gradient").default ?? require("react-native-linear-gradient")

  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
  },
})
