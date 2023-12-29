import { Image as Original, ImageProps as OriginalProps } from "expo-image"

export type ImageProps = OriginalProps
export function Image(props: ImageProps) {
  return (
    <Original
      {...props}
      cachePolicy="none"
      onLoad={(event) => {
        // console.log(`Loading image informaion.`)
        // console.log(event)

        if (props.onLoad) {
          props.onLoad(event)
        }
      }}
      onError={(event) => {
        // console.log(event)
        if (props.onError) {
          props.onError(event)
        }
      }}
    />
  )
}
