import { Image, type ImageProps } from "@/components"
import React, { useMemo, useState } from "react"
import { useWindowDimensions } from "react-native"

export type BookImageProps = ImageProps & {
  availableWidth?: number
  availableHeight?: number
}

type ImageDimension = { width: number; height: number }

const getContainedDimension = (
  sourceDimension: ImageDimension,
  windowDimension: { width: number; height: number },
) => {
  let imageHeight = sourceDimension.height
  let imageWidth = sourceDimension.width

  if (windowDimension.height < imageHeight) {
    imageWidth = (imageWidth * windowDimension.height) / imageHeight
    imageHeight = windowDimension.height
  }

  if (imageWidth > windowDimension.width) {
    imageHeight = (imageHeight * windowDimension.width) / imageWidth
    imageWidth = windowDimension.width
  }

  return { height: imageHeight, width: imageWidth }
}

export function BookPage(props: BookImageProps) {
  const [sourceDimension, setSourceDimension] = useState<ImageDimension>()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const viewportWidth = props.availableWidth ?? windowWidth
  const viewportHeight = props.availableHeight ?? windowHeight
  const dimension = useMemo(() => {
    if (!sourceDimension) {
      return {
        width: viewportWidth,
        height: viewportHeight,
      }
    }

    return getContainedDimension(sourceDimension, {
      width: viewportWidth,
      height: viewportHeight,
    })
  }, [sourceDimension, viewportHeight, viewportWidth])

  return (
    <Image
      source={props.source}
      style={dimension}
      contentFit={"contain"}
      onLoad={(e) => {
        if (!e?.source?.height || !e?.source?.width) {
          // Web can omit source dimensions; fall back to window size.
          setSourceDimension({ height: viewportHeight, width: viewportWidth })
          return
        }

        setSourceDimension({ height: e.source.height, width: e.source.width })
      }}
    />
  )
}
