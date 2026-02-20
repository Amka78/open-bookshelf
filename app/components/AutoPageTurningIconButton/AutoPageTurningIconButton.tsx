import { IconButton } from "@/components"
import type { MessageKey } from "@/i18n"
import { translate } from "@/i18n"
import { Tooltip, TooltipContent, TooltipText, Box } from "@gluestack-ui/themed"
import { useEffect, useState } from "react"

export type AutoPageTurningIconButtonProps = {
  isActive: boolean
  onPress?: () => void
  iconSize?: "md" | "md-" | "sm" | "sm-"
  tooltipTx?: MessageKey
}

export function AutoPageTurningIconButton({
  isActive,
  onPress,
  iconSize = "md-",
  tooltipTx,
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

  const iconButton = (
    <IconButton
      name="timer-outline"
      iconSize={iconSize}
      onPress={onPress}
      style={{ opacity: isActive ? (blinking ? 0.4 : 1) : 1 }}
    />
  )

  return tooltipTx ? (
    <Tooltip placement="bottom" trigger={(triggerProps) => {
      return (
        <Box {...triggerProps}>
          {iconButton}
        </Box>
      )
    }}>
      <TooltipContent>
        <TooltipText>{translate(tooltipTx)}</TooltipText>
      </TooltipContent>
    </Tooltip>
  ) : (
    iconButton
  )
}
