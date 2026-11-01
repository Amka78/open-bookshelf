import { Button, Heading, Text } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React, { useEffect, useRef } from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type ConfirmModalProps = ModalComponentProp<ModalStackParams, void, "ConfirmModal">

export function ConfirmModal(props: ConfirmModalProps) {
  const titleTx = props.modal.params!.titleTx
  const title = props.modal.params!.title
  const messageTx = props.modal.params!.messageTx
  const message = props.modal.params!.message
  const okTx = props.modal.params!.okTx ?? "common.ok"
  const cancelTx = props.modal.params!.cancelTx ?? "common.cancel"
  const onDismiss = props.modal.params!.onDismiss
  const decisionMadeRef = useRef(false)

  useEffect(() => {
    if (!onDismiss) return undefined

    const listener = props.modal.addListener("onClose", () => {
      if (decisionMadeRef.current) return
      onDismiss()
    })

    return () => {
      listener.remove()
    }
  }, [props.modal, onDismiss])

  const onCancelPress = () => {
    decisionMadeRef.current = true
    if (props.modal.params!.onCancelPress) {
      props.modal.params!.onCancelPress()
    }
    props.modal.closeModal()
  }

  return (
    <Root>
      <Header>
        <Heading tx={titleTx} isTruncated={true}>
          {title}
        </Heading>
        <CloseButton
          onPress={() => {
            onCancelPress()
          }}
        />
      </Header>
      <Body>
        <ScrollView>
          <Text tx={messageTx}>{message}</Text>
        </ScrollView>
      </Body>
      <Footer>
        <Button
          onPress={async () => {
            decisionMadeRef.current = true
            if (props.modal.params!.onOKPress) {
              await props.modal.params!.onOKPress()
            }
            props.modal.closeModal()
          }}
          tx={okTx}
        />
        <Button
          onPress={() => {
            onCancelPress()
          }}
          tx={cancelTx}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
