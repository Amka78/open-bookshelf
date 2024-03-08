import { ModalBody } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type BodyProps = ComponentProps<typeof ModalBody>

export function Body(props: BodyProps) {
  return <ModalBody {...props} />
}
