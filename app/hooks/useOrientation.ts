import {
  type Orientation,
  addOrientationChangeListener,
  getOrientationAsync,
  removeOrientationChangeListener,
} from "expo-screen-orientation"
import { useEffect, useState } from "react"

export default function useOrientation(onOrientationChange?: (orientation: Orientation) => void) {
  const [orientation, setOrientation] = useState<Orientation>(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: MST observables are tracked via observer(); adding them to deps would cause infinite re-renders
  useEffect(() => {
    const initializeOrientation = async () => {
      const currentOrientation = await getOrientationAsync()
      setOrientation(currentOrientation)
    }

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
