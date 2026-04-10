import { Image, type ImageProps } from "@/components"
import { useMemo, useState } from "react"
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
// Source stabilization via useMemo: expo-image won't re-trigger its fade
// animation when the parent passes a new source object with the same URI
// (e.g. auth headers object recreated on every render).
// useMemo is appropriate here because the memoization key (sourceUri) differs
// from the actual prop (props.source), which React Compiler cannot infer.
export function BookPage(props: BookImageProps) {
  const [sourceDimension, setSourceDimension] = useState<ImageDimension>()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const viewportWidth = props.availableWidth ?? windowWidth
  const viewportHeight = props.availableHeight ?? windowHeight

  const sourceUri = getSourceUri(props.source)

  // Keep a stable source reference that only updates when the URI changes.
  // When URI is unchanged, stableSource is the same object so expo-image
  // skips its loading transition.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableSource = useMemo(() => props.source, [sourceUri])

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
