import { Button, Heading } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type FormatSelectModalProps = ModalComponentProp<ModalStackParams, void, "FormatSelectModal">

export function FormatSelectModal(props: FormatSelectModalProps) {
  return (
    <Root>
      <Header>
        <Heading tx={"modal.formatSelectModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <ScrollView>
          {props.modal.params.formats.map((format) => {
            return (
              <Button
                key={format}
                onPress={() => {
                  props.modal.params.onSelectFormat(format)
                  props.modal.closeModal()
                }}
                marginBottom={"$1"}
              >
                {format}
              </Button>
            )
          })}
        </ScrollView>
      </Body>
      <Footer>
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
        />
      </Footer>
    </Root>
  )
}
