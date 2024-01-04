import { Button, FormCheckbox, FormInput, Heading, RootContainer, Text, VStack } from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { ApiError } from "@/models/exceptions/Exceptions"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useModal } from "react-native-modalfy"

import { ConnectType } from "../type/ConnectType"
import { LoginType } from "@/components/Modals/LoginModal"

export type ConnectScreenProps = {
  baseUrl: string
  onConnectPress: (data: ConnectType) => Promise<boolean>
  onLoginPress: (data: LoginType) => void
}
export function ConnectScreen(props: ConnectScreenProps) {
  const form = useForm<ConnectType>()
  const modal = useModal<ModalStackParams>()

  const [isLoading, setIsLoading] = useState(false)
  return (
    <RootContainer>
      <VStack justifyContent={"space-between"} flex={1}>
        <Heading testID="connect-heading" tx="connectScreen.welcome" />
        <Text tx="connectScreen.detail" marginTop={"5"} />
        <VStack marginTop={7}>
          <FormCheckbox name={"isOPDS"} tx={"connectScreen.checkbox"} control={form.control} />
          <FormInput
            control={form.control}
            defaultValue={props.baseUrl}
            placeholderTx={"connectScreen.placeHolder"}
            rules={{ required: true }}
            name={"url"}
          />
        </VStack>
        <VStack flex={1} justifyContent="flex-end">
          <Button
            isDisabled={!form.formState.isValid}
            testID="connect-button"
            tx="connectScreen.connect"
            onPress={form.handleSubmit(async (data) => {
              setIsLoading(true)
              try {
                if (!(await props.onConnectPress(data))) {
                  modal.openModal("LoginModal", { onLoginPress: props.onLoginPress })
                }
              } catch (ex) {
                const apiError = ex as ApiError
                modal.openModal("ErrorModal", {
                  titleTx: apiError.errorTx,
                  messageTx: apiError.descriptionTx,
                })
              }
              setIsLoading(false)
            })}
            width={"$full"}
            isLoading={isLoading}
          />
        </VStack>
      </VStack>
    </RootContainer>
  )
}
