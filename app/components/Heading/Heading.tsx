import { type MessageKey, translate } from "@/i18n"
import { Heading as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type HeadingProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Heading(props: HeadingProps) {
  return <Template {...props}>{props.tx ? translate(props.tx) : props.children}</Template>
}
