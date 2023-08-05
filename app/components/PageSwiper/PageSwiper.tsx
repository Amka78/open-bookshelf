import React, { useState } from "react"
import { Gesture, GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler"
import { View } from "react-native"

export type PageSwiperProps = {
  onPageChanged?: () => void
  children: React.ReactNode
  onNextPageChanging: (nextPage: number) => void
  onPreviousPageChanging: (previousPage: number) => void
  currentPage: number
  totalPages: number
  transitionPage: number
}
export function PageSwiper(props: PageSwiperProps) {
  const [direction, setDirection] = useState<"left" | "right">(null)
  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={(event) => {
          if (event.nativeEvent.translationX > 0) {
            setDirection("left")
          } else {
            setDirection("right")
          }
        }}
        onEnded={() => {
          if (direction === "left") {
            props.onNextPageChanging(
              goToNextPage(props.currentPage, props.totalPages, props.transitionPage),
            )
          } else if (direction === "right") {
            props.onPreviousPageChanging(goToPreviousPage(props.currentPage, props.transitionPage))
          }

          if (props.onPageChanged) {
            props.onPageChanged()
          }
          setDirection(null)
        }}
      >
        <View>{props.children}</View>
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
