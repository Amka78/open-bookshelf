import React from "react"
import { Controller, ControllerProps } from "react-hook-form"
import { Input, InputProps } from "../Input/Input"

export type FormInputProps<T> = Omit<InputProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render">
export function FormInput<T>(props: FormInputProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <Input
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
