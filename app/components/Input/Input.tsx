/* eslint-disable react/display-name */
import React, { forwardRef } from "react"
import { Input as Template, IInputProps } from "native-base"
import { MessageKey, translate } from "../../i18n"

export type InputProps = IInputProps & {
  placeholderTx?: MessageKey
}

export const Input = forwardRef(
  ({ variant = "underlined", size = "lg", ...restProps }: InputProps, ref) => {
    const props = { variant, size, ...restProps }
    return (
      <Template
        {...props}
        placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder}
        ref={ref}
      />
    )
  },
)
