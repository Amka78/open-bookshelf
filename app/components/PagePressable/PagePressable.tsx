import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { Pressable } from "@gluestack-ui/themed"
import type { ViewStyle } from "react-native"

export type PagePressableProps = {
  children: React.ReactNode
  direction: "previous" | "next"
  onPageChanging?: (page: number) => void
  onPageChanged?: () => void
  onLongPress: () => void
  currentPage: number
  totalPages: number
  transitionPages: number
  style?: ViewStyle
  disabled?: boolean
}
export function PagePressable(props: PagePressableProps) {
  return (
    <Pressable
      disabled={props.disabled}
      onPress={(event) => {
        let currentPage = 0
        if (props.onPageChanging) {
          if (props.direction === "previous") {
            currentPage = goToPreviousPage(props.currentPage, props.transitionPages)
          } else {
            currentPage = goToNextPage(props.currentPage, props.totalPages, props.transitionPages)
          }

          props.onPageChanging(currentPage)
        }

        if (props.onPageChanged) {
          props.onPageChanged()
        }
      }}
      onLongPress={props.onLongPress}
      style={props.style}
    >
      {props.children}
    </Pressable>
  )
}
