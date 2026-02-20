import { IconButton } from "@/components"
import { useEffect, useState } from "react"

export type AutoPageTurningIconButtonProps = {
  isActive: boolean
  onPress?: () => void
  iconSize?: "md" | "md-" | "sm" | "sm-"
}

export function AutoPageTurningIconButton({
  isActive,
  onPress,
  iconSize = "md-",
}: AutoPageTurningIconButtonProps) {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setBlinking(false)
      return
    }

    const interval = setInterval(() => {
      setBlinking((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <IconButton
      name="timer-outline"
      iconSize={iconSize}
      onPress={onPress}
      style={{ opacity: isActive ? (blinking ? 0.4 : 1) : 1 }}
    />
  )
}
