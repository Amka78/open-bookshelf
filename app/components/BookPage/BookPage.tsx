import { Image, type ImageProps } from "@/components"
import { useState } from "react"
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

const getSourceUri = (source: ImageProps["source"]): string | undefined => {
  if (typeof source === "object" && source !== null && "uri" in source) {
    return (source as { uri?: string | null }).uri ?? undefined
  }
  if (typeof source === "string") {
    return source
  }
  return undefined
}

// React Compiler auto-memoizes this component.
// Source stabilization: expo-image won't re-trigger its fade animation when the
// parent passes a new source object with the same URI (e.g. auth headers object
// recreated on every render). Keep the previous object until the URI changes.
export function BookPage(props: BookImageProps) {
  const [sourceDimension, setSourceDimension] = useState<ImageDimension>()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const viewportWidth = props.availableWidth ?? windowWidth
  const viewportHeight = props.availableHeight ?? windowHeight

  const sourceUri = getSourceUri(props.source)

  // Adjust state during render (React's documented pattern): when the URI is
  // unchanged, keep the previous source object so expo-image skips its
  // loading transition.
  const [stableSource, setStableSource] = useState(props.source)
  if (getSourceUri(stableSource) !== sourceUri) {
    setStableSource(props.source)
  }

  const dimension = sourceDimension
    ? getContainedDimension(sourceDimension, {
        width: viewportWidth,
        height: viewportHeight,
      })
    : {
        width: viewportWidth,
        height: viewportHeight,
      }

  return (
    <Image
      source={stableSource}
      style={dimension}
      contentFit={"contain"}
      pointerEvents="none"
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
