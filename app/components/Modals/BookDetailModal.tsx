import { BookImageItem, Button, HStack, Heading, IconButton, Text, VStack } from "@/components"
import React from "react"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"
import { translate } from "@/i18n"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

export function BookDetailModal(props: BookDetailModalProps) {
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
              <IconButton
                name={"trash-can"}
                onPress={() => {
                  props.modal.openModal("ConfirmModal", {
                    titleTx: "modal.deleteConfirmModal.title",
                    message: translate({
                      key: "modal.deleteConfirmModal.message",
                      restParam: [
                        { key: props.modal.params.library.metaData.title, translate: false },
                      ],
                    }),
                    onOKPress: () => {
                      props.modal.params.library.delete()
                      props.modal.closeModal()
                    },
                  })
                }}
              />
            </HStack>
            {props.modal.params.categories.map((category) => {
              return (
                <HStack key={category.category}>
                  <Text width={"$24"}>{category.name}</Text>
                  <Button variant="link" height={"$6"}>
                    {props.modal.params.library.metaData[category.category]}
                  </Button>
                </HStack>
              )
            })}
          </VStack>
        </HStack>
      </Body>
    </Root>
  )
}
