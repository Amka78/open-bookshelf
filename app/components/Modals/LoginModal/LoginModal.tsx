import { Button, FormInputField, Heading, Input } from "@/components"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from ".."
import { ModalStackParams } from "../Types"
import { useForm } from "react-hook-form"
import { LoginType } from "./type"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"

export type LoginModalProps = ModalComponentProp<ModalStackParams, void, "LoginModal">

export const LoginModal = observer((props: LoginModalProps) => {
  const { authenticationStore } = useStores()
  const form = useForm<LoginType, unknown, LoginType>()
  return (
    <Root>
      <Header>
        <Heading tx={"modal.loginModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <Input>
          <FormInputField
            control={form.control}
            name="userId"
            placeholderTx={"modal.loginModal.userIdPlaceholder"}
            rules={{ required: true }}
          />
        </Input>
        <Input>
          <FormInputField
            control={form.control}
            name="password"
            placeholderTx={"modal.loginModal.passwordPlaceholder"}
            rules={{ required: true }}
          />
        </Input>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit((data) => {
            authenticationStore.login(data.userId, data.password)
            props.modal.closeModal()
          })}
          tx={"common.login"}
        />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
          marginLeft={"$2"}
        />
      </Footer>
    </Root>
  )
})
