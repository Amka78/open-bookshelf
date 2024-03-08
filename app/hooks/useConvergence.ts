import useOrientation from "@/hooks/useOrientation"
import { useBreakpointValue } from "@gluestack-ui/themed"
import * as ScreenOrientation from "expo-screen-orientation"

type OrientationType = "vertical" | "horizontal"
export function useConvergence() {
  const screenOrientation = useOrientation()

  const isLarge = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const orientation: OrientationType =
    isLarge ||
    screenOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    screenOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ? "horizontal"
      : "vertical"

  return {
    orientation,
    isLarge,
  }
}
