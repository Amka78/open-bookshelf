import React, { ComponentProps } from "react"
import { Modal } from "native-base"

export type CloseButtonProps = ComponentProps<typeof Modal.CloseButton>

export function CloseButton(props: CloseButtonProps) {
  return <Modal.CloseButton {...props} />
}
