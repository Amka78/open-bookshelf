import { Image as Original, type ImageProps as OriginalProps } from "expo-image"
import React from "react"
import { logger } from "@/utils/logger"

export type ImageProps = OriginalProps
export function Image(props: ImageProps) {
  return (
    <Original
      {...props}
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
