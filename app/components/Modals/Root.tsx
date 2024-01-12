import React from "react"
import { ModalContent, Modal } from "@gluestack-ui/themed"

export type RootProps = {
  children: React.ReactNode
}

export function Root(props: Readonly<RootProps>) {
  return (
    <Modal isOpen={true}>
      <ModalContent>{props.children}</ModalContent>
    </Modal>
  )
}
