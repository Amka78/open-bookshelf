import { Button, Flex, FormCheckbox, FormInput, Heading, RootContainer, Text } from "@/components"
import { Box } from "native-base"
import React from "react"
import { useForm } from "react-hook-form"

import { ConnectType } from "../types/ConnectType"
import { useModal } from "react-native-modalfy"
import { ModalStackParams } from "@/components/Modals/Types"

export type ConnectScreenProps = {
  baseUrl: string
  onConnectPress: (data: ConnectType) => void
}
export function ConnectScreen(props: ConnectScreenProps) {
  const form = useForm<ConnectType>()
  const modal = useModal<ModalStackParams>()
  return (
    <RootContainer>
      <Flex justify={"space-between"} flex={"1"}>
        <Box flex={"1"}>
          <Heading testID="connect-heading" tx="connectScreen.welcome" />
          <Text tx="connectScreen.detail" marginTop={"5"} />
          <Box marginTop={"7"}>
            <FormCheckbox name={"type"} tx={"connectScreen.checkbox"} control={form.control} />
            <FormInput
              control={form.control}
              defaultValue={props.baseUrl}
              placeholderTx={"connectScreen.placeHolder"}
              rules={{ required: true }}
              name={"url"}
            />
          </Box>
        </Box>
        <Flex flex={"1"} justify={"flex-end"}>
          <Button
            disabled={!form.formState.isValid}
            testID="connect-button"
            tx="connectScreen.connect"
            onPress={form.handleSubmit(async (data) => {
              try {
                props.onConnectPress(data)
              } catch {
                modal.openModal("ErrorModal", {
                  titleTx: "common.error",
                })
              }
            })}
            width={"full"}
          />
        </Flex>
      </Flex>
    </RootContainer>
  )
}
