import {
  type Orientation,
  addOrientationChangeListener,
  getOrientationAsync,
  removeOrientationChangeListener,
} from "expo-screen-orientation"
import { useEffect, useState } from "react"

export default function useOrientation(onOrientationChange?: (orientation: Orientation) => void) {
  const [orientation, setOrientation] = useState<Orientation>(0)

  const initializeOrientation = async () => {
    const orientation = await getOrientationAsync()
    setOrientation(orientation)
  }

  useEffect(() => {
    initializeOrientation()
    const subscription = addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation)
      if (onOrientationChange) {
        onOrientationChange(event.orientationInfo.orientation)
      }
    })

    return () => {
      removeOrientationChangeListener(subscription)
    }
  }, [])

  return orientation
}
