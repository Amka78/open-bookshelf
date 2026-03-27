import { Modal, ModalContent } from "@gluestack-ui/themed"
import type React from "react"
import type { ComponentProps } from "react"

export type RootProps = ComponentProps<typeof ModalContent> & {
  children: React.ReactNode
}

export function Root(props: Readonly<RootProps>) {
  const { children, ...contentProps } = props

  return (
    <Modal isOpen={true}>
      <ModalContent {...contentProps}>{children}</ModalContent>
    </Modal>
  )
}
