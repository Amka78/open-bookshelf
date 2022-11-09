import React from "react"
import { Text as Template, ITextProps } from "native-base"
import { MessageKey, translate } from "../../i18n"

export type TextProps = ITextProps & {
  tx?: MessageKey
}

export function Text(props: TextProps) {
  return <Template {...props} >
    {props.tx ? translate(props.tx) : props.children}
  </Template>
}