import React from "react"
import { Controller, ControllerProps } from "react-hook-form"
import { InputField, InputFieldProps } from "../InputField/InputField"

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
              renderProps.field.onChange(text)
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
