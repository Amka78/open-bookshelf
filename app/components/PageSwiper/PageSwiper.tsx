import React, { useState } from "react"
import { View, ViewStyle } from "react-native"
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler"

export type PageSwiperProps = {
  onPageChanged?: () => void
  children: React.ReactNode
  onNextPageChanging: (nextPage: number) => void
  onPreviousPageChanging: (previousPage: number) => void
  currentPage: number
  totalPages: number
  transitionPage: number
  pagingDirection: "left" | "right"
  style: ViewStyle
}
export function PageSwiper(props: PageSwiperProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">(null)
  return (
    <GestureHandlerRootView style={props.style}>
      <PanGestureHandler
        onGestureEvent={(event) => {
          if (event.nativeEvent.translationX > 0) {
            setSwipeDirection("left")
          } else {
            setSwipeDirection("right")
          }
        }}
        onEnded={() => {
          if (swipeDirection === "left") {
            if (props.pagingDirection === "left") {
              props.onNextPageChanging(
                goToNextPage(props.currentPage, props.totalPages, props.transitionPage),
              )
            } else {
              props.onPreviousPageChanging(
                goToPreviousPage(props.currentPage, props.transitionPage),
              )
            }
          } else if (swipeDirection === "right") {
            if (props.pagingDirection === "left") {
              props.onPreviousPageChanging(
                goToPreviousPage(props.currentPage, props.transitionPage),
              )
            } else {
              props.onNextPageChanging(
                goToNextPage(props.currentPage, props.totalPages, props.transitionPage),
              )
            }
          }

          if (props.onPageChanged) {
            props.onPageChanged()
          }
          setSwipeDirection(null)
        }}
      >
        <View style={props.style}>{props.children}</View>
      </PanGestureHandler>
    </GestureHandlerRootView>
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
