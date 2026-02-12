import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { Text as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type TextProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Text(props: TextProps) {
  const palette = usePalette()
  const { color = palette.textPrimary, ...restProps } = props
  return (
    <Template {...restProps} color={color}>
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
}
