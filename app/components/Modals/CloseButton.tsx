import React, { ComponentProps } from "react"
import { ModalCloseButton } from "@gluestack-ui/themed"

export type CloseButtonProps = ComponentProps<typeof ModalCloseButton>

export function CloseButton(props: CloseButtonProps) {
  return <ModalCloseButton {...props} />
}
