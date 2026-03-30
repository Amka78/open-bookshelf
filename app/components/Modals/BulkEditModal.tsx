import { BookEditFieldList } from "@/components/BookEditFieldList/BookEditFieldList"
import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { logger } from "@/utils/logger"
import { observer } from "mobx-react-lite"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"
import { ScrollView } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type BulkEditModalProps = ModalComponentProp<ModalStackParams, void, "BulkEditModal">

const NON_EDITABLE_KEYS: (keyof MetadataSnapshotIn)[] = [
  "uuid",
  "cover",
  "lastModified",
  "timestamp",
  "size",
  "hash",
  "sharpFixed",
  "formatSizes",
  "langNames",
  "selectedFormat",
]

function computeCommonValues(books: BulkEditModalProps["modal"]["params"]["books"]): Partial<MetadataSnapshotIn> {
  if (books.length === 0) return {}

  const snapshots = books.map((book) => {
    if (!book.metaData) return {} as MetadataSnapshotIn
    return getSnapshot(book.metaData) as MetadataSnapshotIn
  })

  const first = snapshots[0]
  const common: Partial<MetadataSnapshotIn> = {}

  for (const key of Object.keys(first) as (keyof MetadataSnapshotIn)[]) {
    if (NON_EDITABLE_KEYS.includes(key)) continue
    const firstVal = JSON.stringify(first[key])
    const allMatch = snapshots.every((snap) => JSON.stringify(snap[key]) === firstVal)
    if (allMatch) {
      common[key] = first[key] as any
    }
  }

  return common
}

export const BulkEditModal = observer((props: BulkEditModalProps) => {
  const { calibreRootStore } = useStores()
  const { books, libraryId, onComplete } = props.modal.params

  const selectedLibrary = calibreRootStore.selectedLibrary

  const commonValues = computeCommonValues(books)
  const form = useForm<MetadataSnapshotIn, unknown, MetadataSnapshotIn>({
    defaultValues: commonValues as MetadataSnapshotIn,
  })

  const firstBook = books[0]

  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bulkEditModal.title"} />
        <Text text={translate("modal.bulkEditModal.bookCount", { count: books.length })} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          {firstBook && (
            <BookEditFieldList
              book={firstBook}
              control={form.control}
              fieldMetadataList={selectedLibrary.fieldMetadataList}
              tagBrowser={selectedLibrary.tagBrowser}
              height={320}
            />
          )}
        </ScrollView>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit((value) => {
            logger.debug("BulkEditModal dirty fields", form.formState.dirtyFields)
            const editedFields = Object.keys(form.formState.dirtyFields).filter((key) => {
              const v = value[key as keyof MetadataSnapshotIn]
              return v !== null && v !== undefined && v !== ""
            })

            if (editedFields.length === 0) return

            for (const book of books) {
              book.update(libraryId, value, editedFields)
            }

            onComplete?.()
            props.modal.closeModal()
          })}
          tx={"common.save"}
          disabled={Object.keys(form.formState.dirtyFields).length <= 0}
        />
        <Button
          onPress={() => props.modal.closeModal()}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
})
