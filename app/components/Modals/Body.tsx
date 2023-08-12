import React, { ComponentProps } from "react"
import { Modal } from "native-base"

export type BodyProps = ComponentProps<typeof Modal.Body>

export function Body(props: BodyProps) {
  return <Modal.Body {...props} />
}
