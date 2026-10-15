import { Checkbox } from "@/components/Checkbox/Checkbox"
import { Heading } from "@/components/Heading/Heading"
import { VStack } from "@/components/VStack/VStack"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type ColumnVisibilityModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "ColumnVisibilityModal"
>

export function ColumnVisibilityModal(props: ColumnVisibilityModalProps) {
  const { columns, visibility, onToggle } = props.modal.params!

  const isVisible = (key: string): boolean => {
    return visibility[key] !== false
  }

  return (
    <Root>
      <Header>
        <Heading isTruncated={true}>Column Visibility</Heading>
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="md">
          {columns.map((col) => (
            <Checkbox
              key={col.key}
              isChecked={isVisible(col.key)}
              onChange={(checked: boolean) => {
                onToggle(col.key, checked)
              }}
              value={col.key}
            >
              {col.label}
            </Checkbox>
          ))}
        </VStack>
      </Body>
    </Root>
  )
}
