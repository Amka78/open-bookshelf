import {
  BookImageItem,
  Button,
  HStack,
  Heading,
  IconButton,
  LinkButton,
  Text,
  VStack,
} from "@/components"
import React from "react"
import { ModalComponentProp, useModal } from "react-native-modalfy"

import { Body, CloseButton, Footer, Header, Root } from "./"
import { ModalStackParams } from "./Types"
import { translate } from "@/i18n"
import { MetadataField } from "../MetadataField/MetadataField"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

const ExcludeFields = ["title", "sort"]

const BookDetailModalCore = observer((props: BookDetailModalProps) => {
  const { calibreRootStore } = useStores()
  const openViewerHook = useOpenViewer()

  const selectedLibrary = calibreRootStore.getSelectedLibrary()
  return (
    <Root>
      <Header>
        <Heading>{props.modal.params.book.metaData.title}</Heading>
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
              <IconButton
                name={"book-open"}
                iconSize="md-"
                onPress={async () => {
                  await openViewerHook.execute(
                    props.modal.params.book,
                    selectedLibrary.id,
                    props.modal,
                  )
                  props.modal.closeModal()
                }}
              />
              <IconButton name={"download"} iconSize="md-" />
              <IconButton name={"sync-circle"} iconSize="md-" />
              <IconButton name={"book-edit"} iconSize="md-" />
              <IconButton
                name={"trash-can"}
                iconSize="md-"
                onPress={() => {
                  props.modal.openModal("ConfirmModal", {
                    titleTx: "modal.deleteConfirmModal.title",
                    message: translate({
                      key: "modal.deleteConfirmModal.message",
                      restParam: [
                        { key: props.modal.params.book.metaData.title, translate: false },
                      ],
                    }),
                    onOKPress: async () => {
                      if (props.modal.params.onDeleteConfirmOKPress) {
                        props.modal.params.onDeleteConfirmOKPress()
                      }
                      props.modal.closeModal()
                    },
                  })
                }}
              />
            </HStack>
            {props.modal.params.fields.map((field) => {
              const fieldMetadata = props.modal.params.fieldMetadatas.find((value) => {
                return value.label === field
              })
              const value = props.modal.params.book.metaData[fieldMetadata.label]

              return fieldMetadata.name &&
                value &&
                value?.length !== 0 &&
                !ExcludeFields.includes(fieldMetadata.label) ? (
                <MetadataField value={value} fieldMetadata={fieldMetadata} />
              ) : undefined
            })}
          </VStack>
        </HStack>
      </Body>
    </Root>
  )
})

export function BookDetailModal(props: BookDetailModalProps) {
  return <BookDetailModalCore {...props} />
}
