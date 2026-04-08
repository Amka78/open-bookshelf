import { Button } from "@/components/Button/Button"
import { FormInputField } from "@/components/Forms/FormInputField"
import { Heading } from "@/components/Heading/Heading"
import { Input } from "@/components/Input/Input"
import React from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useForm } from "react-hook-form"
import { Body } from "../Body"
import { CloseButton } from "../CloseButton"
import { Header } from "../Header"
import { Footer } from "../ModalFooter"
import { Root } from "../Root"
import type { ModalStackParams } from "../Types"
import type { LoginType } from "./type"

export type LoginModalProps = ModalComponentProp<ModalStackParams, void, "LoginModal">

export const LoginModal = observer((props: LoginModalProps) => {
  const { authenticationStore, calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const onLoginPress = async (data: LoginType) => {
    authenticationStore.login(data.userId, data.password)
    await calibreRootStore.initialize()
    navigation.navigate("CalibreRoot")
  }

  return (
    <LoginModalTemplate
      modal={{ ...props.modal, params: { ...props.modal.params, onLoginPress: onLoginPress } }}
    />
  )
})

export type LoginModalTemplateProps = Pick<
  ModalComponentProp<ModalStackParams, void, "LoginModal">,
  "modal"
>

export function LoginModalTemplate(props: LoginModalTemplateProps) {
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
            type="password"
          />
        </Input>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit(async (data) => {
            await props.modal.params.onLoginPress(data)
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
