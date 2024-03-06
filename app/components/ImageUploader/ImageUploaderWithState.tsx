import { ImageUploader, ImageUploaderProps } from "./ImageUploader"
import { useState } from "react"

export function ImageUploaderWithState(props: ImageUploaderProps) {

  const [image, setImage] = useState()
  return <ImageUploader source={image ? image : props.source} onImageUpload={(url) => {
    setImage(url)
  }} />
}