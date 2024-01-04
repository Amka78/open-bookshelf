import React, { ComponentProps } from "react"
import { Heading as Template } from "@gluestack-ui/themed"
import { MessageKey, translate } from "@/i18n"

export type HeadingProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Heading(props: HeadingProps) {
  return <Template {...props}>{props.tx ? translate(props.tx) : props.children}</Template>
}
