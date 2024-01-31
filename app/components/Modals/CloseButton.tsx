import React, { ComponentProps } from "react"
import { Icon, ModalCloseButton, CloseIcon } from "@gluestack-ui/themed"

export type CloseButtonProps = ComponentProps<typeof ModalCloseButton>

export function CloseButton(props: CloseButtonProps) {
  return (
    <ModalCloseButton {...props}>
      <Icon as={CloseIcon} />
    </ModalCloseButton>
  )
}
