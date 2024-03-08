import { Button, Heading, Text } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type ErrorModalProps = ModalComponentProp<ModalStackParams, void, "ErrorModal">

export function ErrorModal(props: ErrorModalProps) {
  const titleTx = props.modal.params.titleTx
  const title = props.modal.params.title
  const messageTx = props.modal.params.messageTx
  const message = props.modal.params.message

  return (
    <Root>
      <Header>
        <Heading tx={titleTx} isTruncated={true}>
          {title}
        </Heading>
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
