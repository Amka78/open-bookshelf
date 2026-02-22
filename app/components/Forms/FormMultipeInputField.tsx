import { Input } from "@/components"
import { Controller, type ControllerProps } from "react-hook-form"
import { InputField, type InputFieldProps } from "../InputField/InputField"

export type FormMultipleInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    textToValue: string
    valueToText: string
  }
export function FormMultipleInputField<T>(props: FormMultipleInputFiledProps<T>) {
  const {
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
    textToValue,
    valueToText,
    ...inputProps
  } = props

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      disabled={disabled}
      render={(renderProps) => {
        const parsedSeparator = textToValue ?? ","
        const displaySeparator = valueToText ?? ", "
        const value = Array.isArray(renderProps.field.value)
          ? renderProps.field.value.join(displaySeparator)
          : ""

        return (
          <InputField
            {...inputProps}
            onChangeText={(text) => {
              const splitted = parsedSeparator === "" ? [text] : text.split(parsedSeparator)
              const normalized = splitted.map((entry) => entry.trim()).filter(Boolean)

              renderProps.field.onChange(normalized)
            }}
            onBlur={renderProps.field.onBlur}
            value={value}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
