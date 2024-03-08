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

export function BookEditFieldList(props: BookEditFieldListProps) {
  const fields = []

  props.fieldMetadataList.forEach((value) => {
    if (value.isEditable) {
      fields.push(<BookEditField book={props.book} control={props.control} fieldMetadata={value} />)
    }
  })
  return (
    <Box {...props}>
      <ScrollView>{fields}</ScrollView>
    </Box>
  )
}
