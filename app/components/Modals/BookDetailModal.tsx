import {
  BookDetailMenu,
  BookImageItem,
  HStack,
  Heading,
  VStack,
  MetadataFieldList,
} from "@/components"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Header, Root } from "./"
import { ModalStackParams } from "./Types"
import { translate } from "@/i18n"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import * as FileSystem from "expo-file-system"
import { delay } from "@/utils/delay"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

const BookDetailModalCore = observer((props: BookDetailModalProps) => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const openViewerHook = useOpenViewer()

  const selectedLibrary = calibreRootStore.selectedLibrary

  const book = props.modal.params.book
  const downloadResumable = FileSystem.createDownloadResumable(
    `${settingStore.api.baseUrl}/get/${book.metaData.formats[0]}/${book.id}/${selectedLibrary.id}`,
    FileSystem.documentDirectory + "small.cbz",
    {
      headers: authenticationStore.getHeader(),
    },
  )
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
            <BookDetailMenu
              onOpenBook={async () => {
                await openViewerHook.execute(
                  props.modal.params.book,
                  selectedLibrary.id,
                  props.modal,
                )
                props.modal.closeModal()
              }}
              onDownloadBook={async () => {
                const result = await downloadResumable.downloadAsync()
                console.log(result)
              }}
              onConvertBook={() => {}}
              onShowEdit={() => {}}
              onDeleteBook={() => {
                props.modal.openModal("ConfirmModal", {
                  titleTx: "modal.deleteConfirmModal.title",
                  message: translate({
                    key: "modal.deleteConfirmModal.message",
                    restParam: [{ key: props.modal.params.book.metaData.title, translate: false }],
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
            <MetadataFieldList
              book={props.modal.params.book}
              fieldNameList={props.modal.params.fields}
              fieldMetadataList={props.modal.params.fieldMetadatas}
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
})

export function BookDetailModal(props: BookDetailModalProps) {
  return <BookDetailModalCore {...props} />
}
