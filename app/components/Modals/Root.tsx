import { Modal, ModalBackdrop, ModalContent } from "@gluestack-ui/themed"
import type React from "react"
import type { ComponentProps } from "react"

export type RootProps = ComponentProps<typeof ModalContent> & {
  children: React.ReactNode
  onBackdropPress?: () => void
}

export function Root(props: Readonly<RootProps>) {
  const { children, onBackdropPress, ...contentProps } = props

  return (
    <Modal isOpen={true}>
      {onBackdropPress ? (
        <ModalBackdrop bg="transparent" onPress={onBackdropPress} testID="modal-backdrop" />
      ) : null}
      <ModalContent {...contentProps}>{children}</ModalContent>
    </Modal>
  )
}
