import { MessageKey, translate } from "@/i18n"
import { Button as Template, IButtonProps } from "native-base"
import React from "react"

export type ButtonProps = IButtonProps & {
  tx?: MessageKey
}
export function Button(props: ButtonProps) {
  return (
    <Template {...props} colorScheme={"blueGray"}>
      {props.tx ? translate(props.tx) : props.children}
    </Template>
  )
}
