import React, { ComponentProps } from "react"
import { ModalFooter } from "@gluestack-ui/themed"

export type FooterProps = ComponentProps<typeof ModalFooter>

export function Footer(props: FooterProps) {
  return <ModalFooter {...props} />
}
