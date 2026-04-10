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
// Source stabilization uses React's "setState during render" derived-state
// pattern so that expo-image does not re-trigger its fade transition when the
// parent re-renders with a new source object but the same URI (e.g. auth
// headers recreated on every render). Unlike useRef, React state is properly
// tracked by React Compiler, so page navigation (URI changes) still works.
export function BookPage(props: BookImageProps) {
  const [sourceDimension, setSourceDimension] = useState<ImageDimension>()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const viewportWidth = props.availableWidth ?? windowWidth
  const viewportHeight = props.availableHeight ?? windowHeight

  const sourceUri = getSourceUri(props.source)

  // Derived-state: keep a stable source reference that only updates when the
  // URI changes. Uses React's setState-during-render pattern (see React docs:
  // "Storing information from previous renders"). When the URI is unchanged,
  // stableSource keeps the original object so expo-image skips its transition.
  const [stableSource, setStableSource] = useState<ImageProps["source"]>(props.source)
  const [prevUri, setPrevUri] = useState(sourceUri)
  if (sourceUri !== prevUri) {
    setPrevUri(sourceUri)
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
