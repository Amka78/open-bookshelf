import {
  BookDetailFieldList,
  BookDetailMenu,
  BookImageItem,
  HStack,
  Heading,
  VStack,
} from "@/components"
import type { ModalComponentProp } from "react-native-modalfy"

import { useOpenViewer } from "@/hooks/useOpenViewer"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import * as FileSystem from "expo-file-system"
import { observer } from "mobx-react-lite"
import { Body, CloseButton, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

export const BookDetailModal = observer((props: BookDetailModalProps) => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const openViewerHook = useOpenViewer()

  const selectedLibrary = calibreRootStore.selectedLibrary

  const selectedBook = selectedLibrary.selectedBook
  const downloadResumable = FileSystem.createDownloadResumable(
    `${settingStore.api.baseUrl}/get/${selectedBook.metaData.formats[0]}/${selectedBook.id}/${selectedLibrary.id}`,
    FileSystem.documentDirectory + "small.cbz",
    {
      headers: authenticationStore.getHeader(),
    },
  )

  const onOpenBook = async () => {
    await openViewerHook.execute(props.modal)
    props.modal.closeModal()
  }

  const onDownloadBook = async () => {
    const result = await downloadResumable.downloadAsync()
    console.log(result)
  }
  const onDeleteBook = () => {
    props.modal.openModal("ConfirmModal", {
      titleTx: "modal.deleteConfirmModal.title",
      message: translate({
        key: "modal.deleteConfirmModal.message",
        restParam: [{ key: selectedBook.metaData.title, translate: false }],
      }),
      onOKPress: async () => {
        if (props.modal.params.onDeleteConfirmOKPress) {
          props.modal.params.onDeleteConfirmOKPress()
        }
        props.modal.closeModal()
      },
    })
  }
  return (
    <BookDetailModalTemplate
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook: selectedBook,
          onOpenBook: onOpenBook,
          onDownloadBook: onDownloadBook,
          onDeleteBook: onDeleteBook,
        },
      }}
    />
  )
})

export type BookDetailModalTemplateProps = ModalComponentProp<
  ModalStackParams,
  void,
  "BookDetailModal"
>

export function BookDetailModalTemplate(props: BookDetailModalTemplateProps) {
  return (
    <Root>
      <Header>
        <Heading isTruncated={true}>{props.modal.params.selectedBook.metaData.title}</Heading>
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
            <BookDetailMenu
              onOpenBook={props.modal.params.onOpenBook}
              onDownloadBook={props.modal.params.onDownloadBook}
              onConvertBook={props.modal.params.onConvertBook}
              onShowEdit={props.modal.params.onEditBook}
              onDeleteBook={props.modal.params.onDeleteBook}
            />
            <BookDetailFieldList
              book={props.modal.params.selectedBook}
              fieldNameList={props.modal.params.fieldNameList}
              fieldMetadataList={props.modal.params.fieldMetadataList}
              onFieldPress={(query) => {
                if (props.modal.params.onLinkPress) {
                  props.modal.params.onLinkPress(query)
                  props.modal.closeModal()
                }
              }}
            />
          </VStack>
        </HStack>
      </Body>
    </Root>
  )
}
