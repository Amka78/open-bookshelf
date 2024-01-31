import {
  Box,
  BookImageItem,
  Button,
  FormInputField,
  HStack,
  Heading,
  IconButton,
  Input,
  Text,
  VStack,
} from "@/components"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"
import { useForm } from "react-hook-form"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

export function BookDetailModal(props: BookDetailModalProps) {
  //const form = useForm<LoginType>()

  return (
    <Root>
      <Header>
        <Heading tx={"modal.bookDetailModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <HStack>
          <BookImageItem source={props.modal.params.imageUrl} />
          <VStack height={320}>
            <HStack>
              <IconButton name={"sync-circle"} />
              <IconButton name={"book-edit"} />
              <IconButton name={"trash-can"} />
            </HStack>
            {props.modal.params.categories.map((category) => {
              return (
                <HStack key={category.category}>
                  <Text width={"$24"}>{category.name}</Text>
                  <Text>{props.modal.params.library.metaData[category.category]}</Text>
                </HStack>
              )
            })}
          </VStack>
        </HStack>

        {/* <Input>
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
        </Input> */}
      </Body>
    </Root>
  )
}
