/* eslint-disable react/display-name */
import React, { forwardRef } from "react"
import { Checkbox as Template, ICheckboxProps as TemplateProps } from "native-base"
import { MessageKey, translate } from "../../i18n"
export type ICheckboxProps = TemplateProps & {
  tx: MessageKey
}
export const Checkbox = forwardRef((props: ICheckboxProps, ref) => {
  return (
    // @ts-ignore
    <Template {...props} ref={ref} alignItems={"center"}>
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
})
