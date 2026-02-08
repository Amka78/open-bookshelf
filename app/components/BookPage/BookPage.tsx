import { Image, type ImageProps } from "@/components"
import React, { useState } from "react"
import { useWindowDimensions } from "react-native"

export type BookImageProps = ImageProps

type ImageDimension = { width: number; height: number }
export function BookPage(props: BookImageProps) {
  const [dimension, setDimension] = useState<ImageDimension>()
  const windowDimension = useWindowDimensions()
  return (
    <Image
      source={props.source}
      style={[{ width: "100%", height: "100%" }, dimension]}
      contentFit={"contain"}
      onLoad={(e) => {
        if (!dimension) {
          if (!e?.source?.height || !e?.source?.width) {
            // Web can omit source dimensions; fall back to window size.
            setDimension({ height: windowDimension.height, width: windowDimension.width })
            return
          }

          let imageHeight = e.source.height
          let imageWidth = e.source.width

          if (windowDimension.height < imageHeight) {
            imageWidth = (imageWidth * windowDimension.height) / imageHeight
            imageHeight = windowDimension.height
          }

          if (imageWidth > windowDimension.width) {
            imageWidth = windowDimension.width
          }

          setDimension({ height: imageHeight, width: imageWidth })
        }
      }}
    />
  )
}
