import { BookEditFieldList, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import type { Book, Category, FieldMetadataMap, MetadataSnapshotIn } from "@/models/calibre"
import type { ComponentProps } from "react"
import type { Control } from "react-hook-form"

export type BulkEditContentProps = {
  books: Book[]
  control: Control<MetadataSnapshotIn, unknown>
  fieldMetadataList: FieldMetadataMap
  tagBrowser?: Category[]
  containerProps?: ComponentProps<typeof VStack>
  fieldListProps?: Omit<
    ComponentProps<typeof BookEditFieldList>,
    "book" | "control" | "fieldMetadataList" | "tagBrowser"
  >
}

export function BulkEditContent({
  books,
  control,
  fieldMetadataList,
  tagBrowser,
  containerProps,
  fieldListProps,
}: BulkEditContentProps) {
  const firstBook = books[0]

  return (
    <VStack space="xs" testID="bulk-edit-content" {...containerProps}>
      <Text testID="bulk-edit-book-count">
        {translate("modal.bulkEditModal.bookCount", { count: books.length })}
      </Text>
      {firstBook ? (
        <BookEditFieldList
          book={firstBook}
          control={control}
          fieldMetadataList={fieldMetadataList}
          tagBrowser={tagBrowser}
          {...fieldListProps}
        />
      ) : null}
    </VStack>
  )
}
