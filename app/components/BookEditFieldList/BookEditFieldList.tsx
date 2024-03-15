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
  const fields = []

  EditFieldSort.forEach((label) => {
    const value = props.fieldMetadataList.get(label)
    if (value.isEditable && value.name) {
      fields.push(<BookEditField book={props.book} control={props.control} fieldMetadata={value} />)
    }
  })
  return (
    <Box {...props}>
      <ScrollView>{fields}</ScrollView>
    </Box>
  )
}
