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
import { Platform } from "react-native"
import { Body, CloseButton, Header, Root } from "./"
import type { ModalStackParams } from "./Types"
import { useDeleteBook } from "@/hooks/useDeleteBook"

export type BookDetailModalProps = ModalComponentProp<ModalStackParams, void, "BookDetailModal">

async function loadFile(uri: string, fileSize: number) {
  try {
    let pos = 0
    const chunkSize = 1000000 // 1 Mb chunk
    const stringStore = []
    while (pos < fileSize) {
      const tmpString = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        position: pos,
        length: chunkSize,
      })
      stringStore.push(tmpString)
      pos += chunkSize
    }
    const loadedResult = stringStore.join()
    return loadedResult
  } catch (error) {
    console.log(`Big error in importing: ${error}!`)
  }
}

async function writeFile(uri: string, base64: string, fileSize: number) {
  try {
    let pos = 0
    const chunkSize = 1000000 // 1 Mb chunk
    const stringStore = []
    while (pos < fileSize) {
      const result = await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
        length: chunkSize,
      })
      console.log(result)
      pos += chunkSize
    }
  } catch (error) {
    console.log(`Big error in importing: ${error}!`)
  }
}

async function saveFile(uri: string, filename: string, mimetype, fileSize: number) {
  if (Platform.OS === "android") {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

    if (permissions.granted) {
      const base64 = await loadFile(uri, fileSize)

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        mimetype,
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          })
        })
        .catch((e) => console.log(e))
    } else {
      //shareAsync(uri)
    }
  } else {
    //shareAsync(uri)
  }
}

export const BookDetailModal = observer((props: BookDetailModalProps) => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()

  const selectedLibrary = calibreRootStore.selectedLibrary

  const selectedBook = selectedLibrary.selectedBook

  const onOpenBook = async () => {
    await openViewerHook.execute(props.modal)
    props.modal.closeModal()
  }

  const onDownloadBook = async () => {
    const fileName = `${selectedBook.id}.${selectedBook.metaData.formats[0]}`
    const result = await FileSystem.downloadAsync(
      `${settingStore.api.baseUrl}/get/${selectedBook.metaData.formats[0]}/${selectedBook.id}/${selectedLibrary.id}`,
      FileSystem.documentDirectory + fileName,
      {
        headers: authenticationStore.getHeader(),
      },
    )
    console.log(result)
    saveFile(result.uri, fileName, result.headers["Content-Type"], result.headers["Content-Length"])
  }

  const onEditBook = () => {
    props.modal.openModal("BookEditModal", {
      imageUrl: props.modal.params.imageUrl,
    })
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
          onDeleteBook: deleteBookHook.execute,
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
