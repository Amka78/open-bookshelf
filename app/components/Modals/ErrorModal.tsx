import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
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
