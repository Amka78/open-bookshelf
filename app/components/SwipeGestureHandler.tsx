import React, { useState } from "react"
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler"

export type SwipeGestureHandlerProps = {
  onLeftSwipe?: () => void
  onRightSwipe?: () => void
  onSwipeEnded?: () => void
  children: React.ReactNode
}
export function SwipeGestureHandler(props: SwipeGestureHandlerProps) {
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
          console.log(direction)
          if (direction === "left") {
            if (props.onLeftSwipe) {
              props.onLeftSwipe()
            }
          } else if (direction === "right") {
            if (props.onRightSwipe) {
              props.onRightSwipe()
            }
          }

          if (props.onSwipeEnded) {
            props.onSwipeEnded()
          }
          setDirection(null)
        }}
      >
        {props.children}
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}
