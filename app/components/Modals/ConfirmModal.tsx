import { Button, Heading, Text } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type ConfirmModalProps = ModalComponentProp<ModalStackParams, void, "ConfirmModal">

export function ConfirmModal(props: ConfirmModalProps) {
  const titleTx = props.modal.params.titleTx
  const title = props.modal.params.title
  const messageTx = props.modal.params.messageTx
  const message = props.modal.params.message

  const onCancelPress = () => {
    if (props.modal.params.onCancelPress) {
      props.modal.params.onCancelPress()
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
            if (props.modal.params.onOKPress) {
              await props.modal.params.onOKPress()
            }
            props.modal.closeModal()
          }}
          tx={"common.ok"}
        />
        <Button
          onPress={() => {
            onCancelPress()
          }}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
