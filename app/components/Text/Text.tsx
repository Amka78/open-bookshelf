import { MessageKey, translate } from "@/i18n"
import { ITextProps, Text as Template } from "native-base"
import React from "react"

export type TextProps = ITextProps & {
  tx?: MessageKey
}

export function Text(props: TextProps) {
  return <Template {...props}>{props.tx ? translate(props.tx) : props.children}</Template>
}
