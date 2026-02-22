import { BookEditFieldList, Button, FormImageUploader, HStack, Heading } from "@/components"
import type { ModalComponentProp } from "react-native-modalfy"

import { useStores } from "@/models"
import type { Metadata } from "@/models/calibre"
import { logger } from "@/utils/logger"
import { getSnapshot } from "mobx-state-tree"
import { observer } from "mobx-react-lite"
import { useForm } from "react-hook-form"
import { Body, CloseButton, Footer, Header, Root } from "."
import type { ModalStackParams } from "./Types"

export type BookEditModalProps = ModalComponentProp<ModalStackParams, void, "BookEditModal">

export const BookEditModal = observer((props: BookEditModalProps) => {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  return (
    <BookEditModalTemplate
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook: selectedBook,
          fieldMetadataList: selectedLibrary.fieldMetadataList,
          onOKPress(value, updateFields) {
            selectedBook.update(selectedLibrary.id, value, updateFields)
            props.modal.closeModal()
          },
        },
      }}
    />
  )
})
export function BookEditModalTemplate(props: BookEditModalProps) {
  const form = useForm<Metadata, unknown, Metadata>({
    defaultValues: props.modal.params.selectedBook.metaData
      ? (getSnapshot(props.modal.params.selectedBook.metaData) as Metadata)
      : undefined,
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
            name={"cover"}
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
            logger.debug("BookEditModal dirty fields", form.formState.dirtyFields)
            if (props.modal.params.onOKPress) {
              props.modal.params.onOKPress(value, Object.keys(form.formState.dirtyFields))
            }
            //props.modal.closeModal()
          })}
          tx={"common.ok"}
          disabled={Object.keys(form.formState.dirtyFields).length <= 0}
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
