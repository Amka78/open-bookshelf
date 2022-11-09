import React from "react"
import { Input as Template, IInputProps } from "native-base"
import { MessageKey, translate } from "../../i18n"

export type InputProps = IInputProps & {
  placeholderTx?: MessageKey 
} 

export function Input(props: InputProps) {
  return <Template {...props} placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder} />
}

