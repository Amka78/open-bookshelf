import { CSSProperties, createElement, forwardRef } from "react"
import { Input } from "@/components"
import { styled } from "@gluestack-ui/themed"

export type DateTimePickerProps = {
  value: string
  onChange: (date: string) => void
  coreStyle?: CSSProperties
}

const DateTimePickerCore = forwardRef((props: DateTimePickerProps, ref) => {
  return createElement("input", {
    type: "date",
    value: props.value ? props.value.split("T")[0] : undefined,
    onChange: (event) => {
      if (event.target.value === "") {
        props.onChange(undefined)
      } else {
        props.onChange(new Date(event.target.value).toISOString())
      }
    },
    ref: ref,
    style: {
      ...props.coreStyle,
      height: "full",
      width: "full",
      borderWidth: 0,
      marginLeft: 1.5,
      fontSize: 20,
      backgroundColor: "transparent",
      borderTop: 0,
      borderLeft: 0,
      borderRight: 0,
    },
  })
})

export const DateTimePicker = styled(DateTimePickerCore, {})
