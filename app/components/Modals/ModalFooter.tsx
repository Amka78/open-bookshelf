import React, { ComponentProps } from "react"
import { Modal } from "native-base"

export type FooterProps = ComponentProps<typeof Modal.Footer>

export function Footer(props: FooterProps) {
  return <Modal.Footer {...props} />
}
