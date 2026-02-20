import { Button, Heading, Input, Text } from "@/components"
import { InputField, VStack } from "@gluestack-ui/themed"
import { useState } from "react"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body, CloseButton, Footer, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type ViewerAutoPageTurnSettingModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "ViewerAutoPageTurnSettingModal"
>

export function ViewerAutoPageTurnSettingModal(props: ViewerAutoPageTurnSettingModalProps) {
  const [intervalInput, setIntervalInput] = useState(String(props.modal.params.intervalMs))
  const intervalMs = Number(intervalInput)
  const isInvalidInterval = !Number.isFinite(intervalMs) || intervalMs < 100

  return (
    <Root>
      <Header>
        <Heading tx="modal.viewerHeaderAutoPageTurn.title" />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <VStack space="md">
          <Text tx="modal.viewerHeaderAutoPageTurn.intervalLabel" />
          <Input>
            <InputField
              value={intervalInput}
              onChangeText={setIntervalInput}
              keyboardType="number-pad"
              inputMode="numeric"
            />
          </Input>
          <Text tx="modal.viewerHeaderAutoPageTurn.minIntervalHelp" fontSize="$sm" />
        </VStack>
      </Body>
      <Footer>
        <Button
          tx="common.save"
          isDisabled={isInvalidInterval}
          onPress={() => {
            if (isInvalidInterval) return
            props.modal.params.onSave(Math.floor(intervalMs))
            props.modal.closeModal()
          }}
        />
        <Button
          tx="common.cancel"
          marginLeft="$2"
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Footer>
    </Root>
  )
}
