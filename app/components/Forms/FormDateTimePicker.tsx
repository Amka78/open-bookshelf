import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"
import { DateTimePicker, type DateTimePickerProps } from "../DateTimePicker/DateTimePicker"

export type FormDateTimePickerProps<T> = Omit<DateTimePickerProps, "value" | "onChange"> &
  Omit<ControllerProps<T>, "render">
export function FormDateTimePicker<T extends FieldValues>(props: FormDateTimePickerProps<T>) {
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
            value={renderProps.field.value as string}
          />
        )
      }}
    />
  )
}
