import React from "react"
import FastImage, { FastImageProps } from "react-native-fast-image"

export type ImageProps = FastImageProps
export function Image(props: ImageProps) {
  return <FastImage {...props} />
}
