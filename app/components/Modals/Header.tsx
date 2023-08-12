import React, { ComponentProps } from "react"
import { Modal } from "native-base"
import { MessageKey, translate } from "@/i18n"

export type HeaderProps = ComponentProps<typeof Modal.Header> & {
  tx?: MessageKey
}

export function Header(props: HeaderProps) {
  return <Modal.Header {...props}>{props.tx ? translate(props.tx) : props.children}</Modal.Header>
}
