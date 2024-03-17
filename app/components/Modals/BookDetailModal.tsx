import {
  BookDetailFieldList,
  BookDetailMenu,
  BookImageItem,
  HStack,
  Heading,
  VStack,
} from "@/components"
import type { ModalComponentProp } from "react-native-modalfy"

import { useDeleteBook } from "@/hooks/useDeleteBook"
import { useDownloadBook } from "@/hooks/useDownloadBook"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { Body, CloseButton, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

export const BookDetailModal = observer((props: BookDetailModalProps) => {
  const { calibreRootStore } = useStores()
  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  const downloadBookHook = useDownloadBook()

  const selectedLibrary = calibreRootStore.selectedLibrary

  const selectedBook = selectedLibrary.selectedBook

  const onOpenBook = async () => {
    await openViewerHook.execute(props.modal)
    props.modal.closeModal()
  }

  const onDownloadBook = async () => {
    await downloadBookHook.execute(props.modal)
  }

  const onEditBook = () => {
    props.modal.openModal("BookEditModal", {
      imageUrl: props.modal.params.imageUrl,
    })
  }

  const onDeleteBook = async () => {
    await deleteBookHook.execute(props.modal)
  }
  return (
    <BookDetailModalTemplate
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook: selectedBook,
          fieldNameList: selectedLibrary.bookDisplayFields,
          fieldMetadataList: selectedLibrary.fieldMetadataList,
          onOpenBook,
          onDownloadBook,
          onDeleteBook,
          onEditBook,
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
  console.log(props.modal.params)
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
              onEditBook={props.modal.params.onEditBook}
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
