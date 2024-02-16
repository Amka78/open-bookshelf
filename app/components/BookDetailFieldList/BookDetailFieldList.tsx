import { FieldMetadataMap } from "@/models/calibre"
import { Book } from "@/models/CalibreRootStore"
import { Box, BookDetailField, ScrollView } from "@/components"
import { ComponentProps } from "react"

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
          const value = props.book.metaData[fieldName]

          return fieldMetadata?.name &&
            value &&
            value?.length !== 0 &&
            !ExcludeFields.includes(fieldName) ? (
            <BookDetailField
              value={value}
              fieldMetadata={fieldMetadata}
              onLinkPress={props.onFieldPress}
            />
          ) : undefined
        })}
      </ScrollView>
    </Box>
  )
}
