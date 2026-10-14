import { observer } from "mobx-react-lite"
import React, { type FC } from "react"

import {
  Button,
  FormCheckbox,
  FormInputField,
  Heading,
  Input,
  RootContainer,
  Text,
  VStack,
} from "@/components"
import { useConnect } from "./useConnect"

export const ConnectScreen: FC = observer(() => {
  const { form, baseUrl, onConnectPress } = useConnect()

  return (
    <RootContainer>
      <VStack justifyContent={"space-between"} flex={1}>
        <Heading testID="connect-heading" tx="connectScreen.welcome" />
        <Text tx="connectScreen.detail" marginTop={"$5"} />
        <VStack marginTop={7}>
          <FormCheckbox
            name={"isOPDS"}
            tx={"connectScreen.checkbox"}
            control={form.control}
            aria-label={"isOPDS"}
          />
          <Input>
            <FormInputField
              control={form.control}
              defaultValue={baseUrl}
              placeholderTx={"connectScreen.placeHolder"}
              rules={{ required: true }}
              name={"url"}
            />
          </Input>
        </VStack>
        <VStack flex={1} justifyContent="flex-end">
          <Button
            isDisabled={!form.formState.isValid}
            testID="connect-button"
            tx="connectScreen.connect"
            onPress={form.handleSubmit(onConnectPress)}
            width={"$full"}
          />
        </VStack>
      </VStack>
    </RootContainer>
  )
})
