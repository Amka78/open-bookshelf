import { Image as Original, type ImageProps as OriginalProps } from "expo-image"
import React from "react"

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
        console.log(event)
        if (props.onError) {
          props.onError(event)
        }
      }}
    />
  )
}
