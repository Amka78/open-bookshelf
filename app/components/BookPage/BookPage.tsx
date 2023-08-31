import { Image } from "expo-image"
import React, { useState } from "react"
import { useWindowDimensions } from "react-native"

export type BookImageProps = {
  source: string | { uri: string }
}

type ImageDimension = { width: number; height: number }
export function BookPage(props: BookImageProps) {
  const [dimension, setDimension] = useState<ImageDimension>()
  const windowDimension = useWindowDimensions()

  return (
    <Image
      source={props.source}
      //style={{ ...dimension }}
      style={[{ width: "100%", height: "100%" }, dimension]}
      resizeMode={"contain"}
      onLoad={(e) => {
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
      }}
    />
  )
}
