import { Box, ScrollView } from "@/components"
import type { Book, Category, FieldMetadataMap, Metadata } from "@/models/calibre"
import { lowerCaseToCamelCase } from "@/utils/convert"
import { useMemo, type ComponentProps } from "react"
import type { Control } from "react-hook-form"
import { BookEditField } from "./BookEditField"

export type BookEditFieldListProps = {
  fieldMetadataList: FieldMetadataMap
  book: Book
  control: Control<Metadata, unknown>
  tagBrowser?: Category[]
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
  const suggestionMap = useMemo(() => {
    const mappedSuggestions = new Map<string, string[]>()

    props.tagBrowser?.forEach((category) => {
      const metadataLabel = lowerCaseToCamelCase(category.category)
      const suggestions = new Set<string>()

      category.subCategory.forEach((subCategory) => {
        subCategory.children.forEach((node) => {
          if (node.name) {
            suggestions.add(node.name)
          }
        })
      })

      if (suggestions.size > 0) {
        mappedSuggestions.set(metadataLabel, Array.from(suggestions))
      }
    })

    return mappedSuggestions
  }, [props.tagBrowser])

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
        suggestions={suggestionMap.get(value.label)}
      />
    )
  })

  return (
    <Box {...props}>
      <ScrollView>{fields}</ScrollView>
    </Box>
  )
}
