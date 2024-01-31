import { Button, Text, Heading } from "@/components"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"

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
                variant={"ghost"}
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
