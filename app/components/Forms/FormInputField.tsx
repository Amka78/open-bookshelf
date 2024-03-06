import { Controller, ControllerProps } from "react-hook-form"
import { InputField, InputFieldProps } from "../InputField/InputField"
import { Input } from "@/components"

export type FormInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render">
export function FormInputField<T>(props: FormInputFiledProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <Input>
            <InputField
              {...props}
              onChangeText={(text) => {
                if (text !== "") {
                  renderProps.field.onChange(text)
                } else {
                  renderProps.field.onChange(undefined)
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
