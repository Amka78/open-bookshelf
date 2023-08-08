/* eslint-disable react/display-name */
import { MessageKey, translate } from "@/i18n"
import { Checkbox as Template, ICheckboxProps as TemplateProps } from "native-base"
import React, { forwardRef } from "react"

export type ICheckboxProps = TemplateProps & {
  tx: MessageKey
}
export const Checkbox = forwardRef((props: ICheckboxProps, ref) => {
  return (
    // @ts-ignore
    <Template {...props} ref={ref}>
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
})
