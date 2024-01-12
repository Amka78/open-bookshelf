import { Button, FormInputField, Heading, Input } from "@/components"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from ".."
import { ModalStackParams } from "../Types"
import { useForm } from "react-hook-form"
import { LoginType } from "./type"

export type LoginModalProps = ModalComponentProp<ModalStackParams, void, "LoginModal">

export function LoginModal(props: LoginModalProps) {
  const form = useForm<LoginType>()
  return (
    <Root>
      <CloseButton
        onPress={() => {
          props.modal.closeModal()
        }}
      />
      <Header>
        <Heading tx={"modal.loginModal.title"} />
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
            props.modal.params.onLoginPress(data)
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
}
