import { Controller, ControllerProps } from "react-hook-form"
import { InputField, InputFieldProps } from "../InputField/InputField"
import { Input } from "@/components"

export type FormMultipleInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    textToValue: string
    valueToText: string
  }
export function FormMultipleInputField<T>(props: FormMultipleInputFiledProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <Input>
            <InputField
              {...props}
              onChangeText={(text) => {
                const splitted = text.split(props.textToValue)

                if (splitted.length === 1 && splitted[0] === "") {
                  renderProps.field.onChange(undefined)
                } else {
                  renderProps.field.onChange(splitted)
                }
              }}
              onBlur={renderProps.field.onBlur}
              value={renderProps.field.value as string}
              ref={renderProps.field.ref}
            />
          </Input>
        )
      }}
    />
  )
}
