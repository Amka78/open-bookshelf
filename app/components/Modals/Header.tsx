import React, { ComponentProps } from "react"
import { ModalHeader } from "@gluestack-ui/themed"

export type HeaderProps = ComponentProps<typeof ModalHeader>

export function Header(props: HeaderProps) {
  return <ModalHeader {...props} />
}
