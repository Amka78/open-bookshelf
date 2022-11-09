import { Button as Template } from "native-base"
import React, { ComponentProps } from "react"

import { MessageKey, translate } from "../../i18n"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export function Button(props: ButtonProps) {

  return <Template {...props}  >
    {props.tx ? translate(props.tx) : props.children}
  </Template>
}