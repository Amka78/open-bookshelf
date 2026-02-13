import { Box, IconButton, Text } from "@/components"
import type { IconButtonProps } from "@/components"
import type { MessageKey } from "@/i18n"
import { useState } from "react"
import { StyleSheet } from "react-native"

export type TooltipIconButtonProps = IconButtonProps & {
  tooltipTx?: MessageKey
}

export function TooltipIconButton(props: TooltipIconButtonProps) {
  const { tooltipTx, onMouseEnter, onMouseLeave, ...restProps } = props
  const [showTooltip, setShowTooltip] = useState(false)

  const handleMouseEnter = () => {
    onMouseEnter?.()
    if (tooltipTx) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    onMouseLeave?.()
    if (tooltipTx) {
      setShowTooltip(false)
    }
  }

  return tooltipTx ? (
    <Box style={styles.tooltipAnchor} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <IconButton {...restProps} />
      {showTooltip ? (
        <Box style={styles.tooltipContainer}>
          <Text style={styles.tooltipText} tx={tooltipTx} />
        </Box>
      ) : null}
    </Box>
  ) : (
    <IconButton {...restProps} />
  )
}

const styles = StyleSheet.create({
  tooltipAnchor: {
    position: "relative",
    alignItems: "center",
  },
  tooltipContainer: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 6,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
})
