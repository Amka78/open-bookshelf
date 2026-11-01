import { Dimensions } from "react-native"

export const LARGE_SCREEN_MIN_WIDTH = 992

export function isLargeScreen(width = Dimensions.get("window").width): boolean {
  return width >= LARGE_SCREEN_MIN_WIDTH
}
