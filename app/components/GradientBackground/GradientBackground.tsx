import { LinearGradient } from "expo-linear-gradient"
import type { ReactNode } from "react"
import type { ViewStyle } from "react-native"

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
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  )
}
