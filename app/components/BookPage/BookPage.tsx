import ExpoFastImage from "expo-fast-image"
import React, { useState } from "react"

import { PagePressable, PagePressableProps } from "../PagePressable/PagePressable"
import { useWindowDimensions } from "react-native"

export type BookImageProps = Omit<PagePressableProps, "children"> & {
  source: string | { uri: string }
  pageType: "singlePage" | "leftPage" | "rightPage"
}

type ImageDimension = { width: number; height: number }
export function BookPage(props: BookImageProps) {
  const [dimension, setDimension] = useState<ImageDimension>()
  const windowDimension = useWindowDimensions()

  const alignItems =
    props.pageType === "singlePage"
      ? "center"
      : props.pageType === "leftPage"
      ? "flex-end"
      : undefined
  return (
    <PagePressable
      {...props}
      style={{
        alignItems,
        flex: 1,
        ...props.style,
      }}
    >
      <ExpoFastImage
        source={props.source}
        style={{ ...dimension }}
        resizeMode={"contain"}
        onLoad={(e) => {
          let imageHeight = e.nativeEvent.source.height
          let imageWidth = e.nativeEvent.source.width

          if (windowDimension.height < imageHeight) {
            imageWidth = (imageWidth * windowDimension.height) / imageHeight
            imageHeight = windowDimension.height
          }

          setDimension({ height: imageHeight, width: imageWidth })
        }}
      />
    </PagePressable>
  )
}
