import React from "react"
import { ViewStyle } from "react-native"
import { Pressable } from "native-base"

export type PagePressableProps = {
  children: React.ReactNode
  direction: "previous" | "next"
  onPageChanging: (page: number) => void
  onPageChanged: () => void
  onLongPress: () => void
  currentPage: number
  totalPages: number
  transitionPages: number
  style: ViewStyle
}
export function PagePressable(props: PagePressableProps) {
  return (
    <Pressable
      onPress={() => {
        let currentPage = 0
        if (props.direction === "previous") {
          currentPage = goToPreviousPage(props.currentPage, props.transitionPages)
        } else {
          currentPage = goToNextPage(props.currentPage, props.totalPages, props.transitionPages)
        }
        props.onPageChanging(currentPage)
        props.onPageChanged()
      }}
      onLongPress={props.onLongPress}
      style={props.style}
    >
      {props.children}
    </Pressable>
  )
}

function goToPreviousPage(pageNum: number, transitionPages: number) {
  let currentPage = pageNum
  if (pageNum > 0) {
    currentPage = pageNum - transitionPages
  }
  return currentPage
}

function goToNextPage(pageNum: number, totalPage: number, transitionPages: number) {
  let currentPage = pageNum
  if (pageNum < totalPage) {
    currentPage = pageNum + transitionPages
  }
  return currentPage
}
