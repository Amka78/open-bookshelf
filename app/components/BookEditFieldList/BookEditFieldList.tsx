import { FieldMetadataMap, Metadata } from "@/models/calibre"
import { Book } from "@/models/CalibreRootStore"
import { Box, ScrollView, Text } from "@/components"
import { ComponentProps } from "react"
import { BookEditField } from "./BookEditField"
import { Control } from "react-hook-form"

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
