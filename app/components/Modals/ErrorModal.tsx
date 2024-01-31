import { Button, Heading, Text } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"

export type ErrorModalProps = ModalComponentProp<ModalStackParams, void, "ErrorModal">

export function ErrorModal(props: ErrorModalProps) {
  let titleTx
  let title
  let messageTx
  let message
  if (props.modal.params.exception) {
    titleTx = props.modal.params.exception.errorTx
    title = props.modal.params.exception.error
    messageTx = props.modal.params.exception.descriptionTx
    message = props.modal.params.exception.description
  } else {
    titleTx = props.modal.params.titleTx
    title = props.modal.params.title
    messageTx = props.modal.params.messageTx
    message = props.modal.params.message
  }

  return (
    <Root>
      <Header>
        <Heading tx={titleTx}>{title}</Heading>
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
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
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.ok"}
        />
      </Footer>
    </Root>
  )
}
