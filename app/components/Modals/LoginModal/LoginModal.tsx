import { Button, FormInput } from "@/components"
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
      <Header tx={"modal.loginModal.title"} />
      <Body>
        <FormInput
          control={form.control}
          name="userId"
          placeholderTx={"modal.loginModal.userIdPlaceholder"}
          rules={{ required: true }}
        />
        <FormInput
          control={form.control}
          name="password"
          placeholderTx={"modal.loginModal.passwordPlaceholder"}
          rules={{ required: true }}
        />
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
          marginLeft={"2"}
        />
      </Footer>
    </Root>
  )
}
