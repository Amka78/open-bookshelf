import { BookEditFieldList, Button, FormImageUploader, HStack, Heading } from "@/components"
import type { ModalComponentProp } from "react-native-modalfy"

import { useStores } from "@/models"
import type { Metadata } from "@/models/calibre"
import { observer } from "mobx-react-lite"
import { useForm } from "react-hook-form"
import { Body, CloseButton, Footer, Header, Root } from "."
import type { ModalStackParams } from "./Types"

export type BookEditModalProps = ModalComponentProp<ModalStackParams, void, "BookEditModal">

export const BookEditModal = observer((props: BookEditModalProps) => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  return (
    <BookEditModalTemplate
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook: selectedBook,
          onOKPress(value) {
            selectedBook.update(value)
          },
        },
      }}
    />
  )
})
export function BookEditModalTemplate(props: BookEditModalProps) {
  const form = useForm<Metadata, unknown, Metadata>({
    defaultValues: props.modal.params.selectedBook.metaData,
  })
  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bookEditModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <HStack space={"sm"}>
          <FormImageUploader
            control={form.control}
            name={"image"}
            defaultValue={props.modal.params.imageUrl}
          />
          <BookEditFieldList
            book={props.modal.params.selectedBook}
            control={form.control}
            fieldMetadataList={props.modal.params.fieldMetadataList}
            height={320}
            width={240}
          />
        </HStack>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit((value) => {
            if (props.modal.params.onOKPress) {
              props.modal.params.onOKPress(value)
            }
            props.modal.closeModal()
          })}
          tx={"common.ok"}
        />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
