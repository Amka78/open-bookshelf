import React from "react"
import { Heading as Template, IHeadingProps } from "native-base"
import { MessageKey, translate } from "../../i18n"

export type HeadingProps = IHeadingProps & {
  tx?: MessageKey
}

export function Heading(props: HeadingProps) {

  return <Template {...props}>
    {props.tx ? translate(props.tx) : props.children}
  </Template>
}