import { ModalHeader } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type HeaderProps = ComponentProps<typeof ModalHeader>

export function Header(props: HeaderProps) {
  return <ModalHeader {...props} />
}
