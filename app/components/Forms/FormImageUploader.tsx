import { Controller, type ControllerProps } from "react-hook-form"
import { ImageUploader, type ImageUploaderProps } from "../ImageUploader/ImageUploader"

export type FormImageUploaderProps<T> = Omit<ImageUploaderProps, "onImageUpload"> &
  Omit<ControllerProps<T>, "render">
export function FormImageUploader<T>(props: FormImageUploaderProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <ImageUploader
            {...props}
            onImageUpload={(text) => {
              renderProps.field.onChange(text)
            }}
            source={renderProps.field.value as string}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
