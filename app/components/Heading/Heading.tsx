import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { typography } from "@/theme/typography"
import { Heading as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type HeadingProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}

export function Heading({ fontFamily, color, ...props }: HeadingProps) {
  const palette = usePalette()
  return (
    <Template
      fontFamily={fontFamily ?? typography.primary.bold}
      color={color ?? palette.textPrimary}
      {...props}
    >
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
}
