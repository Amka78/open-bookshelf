import { BookEditFieldList } from "@/components/BookEditFieldList/BookEditFieldList"
import { Button } from "@/components/Button/Button"
import { FormImageUploader } from "@/components/Forms/FormImageUploader"
import { HStack } from "@/components/HStack/HStack"
import { Heading } from "@/components/Heading/Heading"
import type { ModalComponentProp } from "react-native-modalfy"

import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { logger } from "@/utils/logger"
import { observer } from "mobx-react-lite"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
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
          tagBrowser: selectedLibrary.tagBrowser,
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
  const rawSnapshot = props.modal.params.selectedBook.metaData
    ? (getSnapshot(props.modal.params.selectedBook.metaData) as MetadataSnapshotIn)
    : undefined
  const langNames = rawSnapshot?.langNames ?? {}
  const hasLangNames = Object.keys(langNames).length > 0
  const defaultValues =
    rawSnapshot && hasLangNames
      ? {
          ...rawSnapshot,
          languages: rawSnapshot.languages
            .map((entry) => String(entry ?? "").trim())
            .filter(Boolean)
            .map((entry) => {
              const nameSet = new Set(Object.values(langNames as Record<string, string>))
              if (nameSet.has(entry)) return entry
              return (langNames as Record<string, string>)[entry] ?? entry
            }),
        }
      : rawSnapshot
  const form = useForm<MetadataSnapshotIn, unknown, MetadataSnapshotIn>({
    defaultValues,
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
            tagBrowser={props.modal.params.tagBrowser}
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
