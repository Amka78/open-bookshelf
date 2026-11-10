import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { Text as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type TextProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Text(props: TextProps) {
  const palette = usePalette()
  const { color, ...restProps } = props
  const resolvedColor = color === undefined ? palette.textPrimary : color
  return (
    <Template {...restProps} color={resolvedColor}>
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
}
