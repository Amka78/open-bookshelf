import { useState } from "react"
import { ImageUploader, type ImageUploaderProps } from "./ImageUploader"

export function ImageUploaderWithState(props: ImageUploaderProps) {
  const [image, setImage] = useState()
  return (
    <ImageUploader
      source={image ? image : props.source}
      onImageUpload={(url) => {
        setImage(url)
      }}
    />
  )
}
