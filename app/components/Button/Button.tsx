import { Button as Template, IButtonProps } from "native-base"
import React from "react"

import { MessageKey, translate } from "../../i18n"

export type ButtonProps = IButtonProps & {
  tx?: MessageKey
}
export function Button(props: ButtonProps) {
  return <Template {...props}>{props.tx ? translate(props.tx) : props.children}</Template>
}
