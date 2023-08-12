import React from "react"
import { Modal, Center } from "native-base"

export type RootProps = {
  children: React.ReactNode
}

export function Root(props: Root) {
  return (
    <Center minW={"xs"} minH={"3xs"}>
      <Modal.Content minW={"xs"} minHeight={"2xs"}>
        {props.children}
      </Modal.Content>
    </Center>
  )
}
