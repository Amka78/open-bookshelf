import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { translate } from "@/i18n"
import { HStack, Input, InputField, ScrollView, VStack } from "@gluestack-ui/themed"
import React, { useState } from "react"
import type { ModalComponentProp } from "react-native-modalfy"
import { View } from "react-native"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type AnnotationModalProps = ModalComponentProp<ModalStackParams, void, "AnnotationModal">

const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "pink", "purple"] as const

const COLOR_MAP: Record<string, string> = {
  yellow: "#FFDC00",
  green: "#64DC64",
  blue: "#64B4FF",
  pink: "#FF96B4",
  purple: "#C882FF",
}

export function AnnotationModal(props: AnnotationModalProps) {
  const { selectedText, onSave } = props.modal.params
  const [notes, setNotes] = useState("")
  const [styleWhich, setStyleWhich] = useState<string>("yellow")

  return (
    <Root>
      <Header>
        <Heading tx="modal.annotationModal.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          <VStack space="sm">
            {selectedText ? (
              <Text style={{ fontStyle: "italic", marginBottom: 8 }}>"{selectedText}"</Text>
            ) : null}
            <Text tx="modal.annotationModal.colorLabel" style={{ marginBottom: 4 }} />
            <HStack space="sm" style={{ marginBottom: 12 }}>
              {HIGHLIGHT_COLORS.map((c) => (
                <Button
                  key={c}
                  onPress={() => setStyleWhich(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLOR_MAP[c],
                    borderWidth: styleWhich === c ? 3 : 0,
                    borderColor: "#000",
                    minWidth: undefined,
                    padding: 0,
                  }}
                />
              ))}
            </HStack>
            <Text tx="modal.annotationModal.notesLabel" style={{ marginBottom: 4 }} />
            <Input>
              <InputField
                placeholder={translate("modal.annotationModal.notesPlaceholder")}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </Input>
          </VStack>
        </ScrollView>
      </Body>
      <Footer>
        <Button
          tx="common.save"
          onPress={() => {
            onSave({ text: selectedText, notes, styleWhich })
            props.modal.closeModal()
          }}
        />
        <Button
          tx="common.cancel"
          marginLeft={"$1"}
          onPress={() => props.modal.closeModal()}
        />
      </Footer>
    </Root>
  )
}
