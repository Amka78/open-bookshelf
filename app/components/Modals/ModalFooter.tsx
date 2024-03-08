import { ModalFooter } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type FooterProps = ComponentProps<typeof ModalFooter>

export function Footer(props: FooterProps) {
  return <ModalFooter {...props} />
}
