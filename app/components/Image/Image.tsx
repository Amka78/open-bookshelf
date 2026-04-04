import { logger } from "@/utils/logger"
import { Image as Original, type ImageProps as OriginalProps } from "expo-image"
import React from "react"

export type ImageProps = OriginalProps
export function Image(props: ImageProps) {
  return (
    <Original
      cachePolicy="memory-disk"
      transition={{ duration: 200 }}
      {...props}
      // Prevent iOS Smart Invert / forced dark mode from inverting image colors
      accessibilityIgnoresInvertColors
      onLoad={(event) => {
        if (props.onLoad) {
          props.onLoad(event)
        }
      }}
      onError={(event) => {
        logger.error("Image load error", event)
        if (props.onError) {
          props.onError(event)
        }
      }}
    />
  )
}
