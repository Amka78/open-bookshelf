import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
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
