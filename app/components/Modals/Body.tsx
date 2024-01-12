import React, { ComponentProps } from "react"
import { ModalBody } from "@gluestack-ui/themed"

export type BodyProps = ComponentProps<typeof ModalBody>

export function Body(props: BodyProps) {
  return <ModalBody {...props} />
}
