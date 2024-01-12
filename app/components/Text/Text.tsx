import { MessageKey, translate } from "@/i18n"
import { Text as Template } from "@gluestack-ui/themed"
import React, { ComponentProps } from "react"

export type TextProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Text(props: TextProps) {
  return <Template {...props}>{props.tx ? translate(props.tx) : props.children}</Template>
}
