import { ViewStyle } from "react-native"
import { Pressable } from "@gluestack-ui/themed"
import { goToPreviousPage, goToNextPage } from "@/utils/pageTurnning"

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
}
export function PagePressable(props: PagePressableProps) {
  return (
    <Pressable
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

