import { Modal, ModalContent } from "@gluestack-ui/themed"
import type React from "react"

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
