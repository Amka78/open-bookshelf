import { useState } from "react"
import { ImageUploader, type ImageUploaderProps } from "./ImageUploader"

export function ImageUploaderWithState(props: ImageUploaderProps) {
  const [image, setImage] = useState<string | undefined>()
  return (
    <ImageUploader
      {...props}
      source={image ? image : props.source}
      onImageUpload={(url) => {
        setImage(url)
        props.onImageUpload(url)
      }}
    />
  )
}
