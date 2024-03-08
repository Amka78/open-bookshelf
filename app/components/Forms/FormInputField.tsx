import { Input } from "@/components"
import { Controller, type ControllerProps } from "react-hook-form"
import { InputField, type InputFieldProps } from "../InputField/InputField"

export type FormInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render">
export function FormInputField<T>(props: FormInputFiledProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <InputField
            {...props}
            onChangeText={(text) => {
              if (text !== "") {
                renderProps.field.onChange(text)
              } else {
                renderProps.field.onChange(null)
              }
            }}
            onBlur={renderProps.field.onBlur}
            value={renderProps.field.value as string}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
