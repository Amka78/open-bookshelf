import { Box, ScrollView, Text } from "@/components"
import type { Book } from "@/models/CalibreRootStore"
import type { FieldMetadataMap, Metadata } from "@/models/calibre"
import type { ComponentProps } from "react"
import type { Control } from "react-hook-form"
import { BookEditField } from "./BookEditField"

export type BookEditFieldListProps = {
  fieldMetadataList: FieldMetadataMap
  book: Book
  control: Control<Metadata, unknown>
} & ComponentProps<typeof Box>

const EditFieldSort = [
  "authors",
  "authorSort",
  "title",
  "sort",
  "series",
  "tags",
  "languages",
  "publisher",
  "pubdate",
  "formats",
  "identifiers",
  "rating",
  "comments",
]
export function BookEditFieldList(props: BookEditFieldListProps) {
  const fields = EditFieldSort.map((label) => {
    const value = props.fieldMetadataList.get(label)
    if (!value || !value.isEditable || !value.name) {
      return null
    }

    return (
      <BookEditField
        key={value.label}
        book={props.book}
        control={props.control}
        fieldMetadata={value}
      />
    )
  })

  return (
    <Box {...props}>
      <ScrollView>{fields}</ScrollView>
    </Box>
  )
}
