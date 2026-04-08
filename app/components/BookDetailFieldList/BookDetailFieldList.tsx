import { Box, ScrollView } from "@/components"
import type { Book, FieldMetadataMap } from "@/models/calibre"
import type { ComponentProps } from "react"
import { BookDetailField } from "./BookDetailField"

export type BookDetailFieldListProps = {
  fieldNameList: string[]
  fieldMetadataList: FieldMetadataMap
  book: Book
  onFieldPress: (fieldValue: string) => void
} & ComponentProps<typeof Box>

const ExcludeFields = ["title", "sort"]

export function BookDetailFieldList(props: BookDetailFieldListProps) {
  return (
    <Box {...props}>
      <ScrollView>
        {props.fieldNameList.map((fieldName) => {
          const fieldMetadata = props.fieldMetadataList.get(fieldName)
          const value = (props.book.metaData as unknown as Record<string, unknown>)[fieldName]
          const isNonEmpty =
            value !== null &&
            value !== undefined &&
            (typeof value === "number" ||
              value instanceof Date ||
              (typeof value === "string" && value.length !== 0) ||
              (Array.isArray(value) && value.length !== 0))

          return fieldMetadata?.name &&
            isNonEmpty &&
            !ExcludeFields.includes(fieldName) ? (
            <BookDetailField
              key={fieldName}
              value={value as string | string[] | number | Date}
              fieldMetadata={fieldMetadata}
              onLinkPress={props.onFieldPress}
            />
          ) : undefined
        })}
      </ScrollView>
    </Box>
  )
}
