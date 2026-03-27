import { useEffect, useState } from "react"
import { Keyboard, type KeyboardEvent } from "react-native"

export function useKeyboardVisibility() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true)
      setKeyboardHeight(event.endCoordinates?.height ?? 0)
    }

    const onHide = () => {
      setIsKeyboardVisible(false)
      setKeyboardHeight(0)
    }

    const showSub = Keyboard.addListener("keyboardDidShow", onShow)
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return {
    isKeyboardVisible,
    keyboardHeight,
  }
}
