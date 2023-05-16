import React from "react"
import { Controller, ControllerProps } from "react-hook-form"

import { Checkbox, ICheckboxProps } from "../Checkbox/Checkbox"

export type FormCheckboxProps<T> = Omit<ICheckboxProps, "onChangeText" | "value"> &
  Omit<ControllerProps<T>, "render">
export function FormCheckbox<T>(props: FormCheckboxProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <Checkbox
            {...props}
            onChange={(isSelected) => {
              renderProps.field.onChange(isSelected)
            }}
            value={renderProps.field.value as string}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
