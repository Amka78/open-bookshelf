import { Button, Heading, Text } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"

export type ErrorModalProps = ModalComponentProp<ModalStackParams, void, "ErrorModal">

export function ErrorModal(props: ErrorModalProps) {
  return (
    <Root>
      <CloseButton
        onPress={() => {
          props.modal.closeModal()
        }}
      />
      <Header>
        <Heading tx={props.modal.params?.titleTx}>{props.modal.params?.title}</Heading>
      </Header>
      <Body>
        <ScrollView>
          <Text tx={props.modal.params?.messageTx}>{props.modal.params?.message}</Text>
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
