/* eslint-disable react/display-name */
import { MessageKey, translate } from "@/i18n"
import { InputField as Template } from "@gluestack-ui/themed"
import React, { ComponentProps, forwardRef } from "react"

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
}

export const InputField = forwardRef((props: InputFieldProps, ref) => {
  return (
    <Template
      {...props}
      placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder}
      ref={ref}
    />
  )
})
