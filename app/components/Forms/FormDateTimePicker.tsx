import { Controller, ControllerProps } from "react-hook-form"
import { DateTimePicker, DateTimePickerProps } from "../DateTimePicker/DateTimePicker"

export type FormDateTimePickerProps<T> = Omit<DateTimePickerProps, "value" | "onChange"> &
  Omit<ControllerProps<T>, "render">
export function FormDateTimePicker<T>(props: FormDateTimePickerProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <DateTimePicker
            {...props}
            onChange={(date) => {
              if (date !== "") {
                renderProps.field.onChange(date)
              } else {
                renderProps.field.onChange(undefined)
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
