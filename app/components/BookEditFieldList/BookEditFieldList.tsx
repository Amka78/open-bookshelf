import { Box, FormInputField, HStack, Input, ScrollView, Text, VStack } from "@/components"
import type { Book, Category, FieldMetadataMap, Metadata } from "@/models/calibre"
import { lowerCaseToCamelCase } from "@/utils/convert"
import { useMemo, type ComponentProps } from "react"
import type { Control, Path } from "react-hook-form"
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

  const languageCodeSuggestions = useMemo(() => {
    const langNames = props.book.metaData?.langNames

    if (!langNames) {
      return undefined
    }

    return Array.from(langNames.keys())
  }, [props.book.metaData?.langNames])

  const fields = EditFieldSort.map((label) => {
    const value = props.fieldMetadataList.get(label)
    if (!value || !value.isEditable || !value.name) {
      return null
    }

    const suggestions =
      label === "languages" && (value.linkColumn === "lamg_code" || value.linkColumn === "lang_code")
        ? languageCodeSuggestions
        : suggestionMap.get(value.label)

    if (label === "series") {
      const seriesIndexName = "seriesIndex" as Path<Metadata>
      const seriesName = value.label as Path<Metadata>

      return (
        <HStack key={`${value.label}-seriesIndex`} space="sm" alignItems="flex-start" width="$full">
          <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"} flex={1} width="$full">
            <Text isTruncated={true} fontWeight="$bold">
              {value.name}
            </Text>
            <Input>
              <FormInputField
                control={props.control}
                name={seriesName}
                suggestions={suggestions}
                width="$full"
              />
            </Input>
          </VStack>
          <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"} width={"$10"}>
            <Box height="$6" />
            <Input width={"$10"}>
              <FormInputField control={props.control} name={seriesIndexName} inputMode="numeric" />
            </Input>
          </VStack>
        </HStack>
      )
    }

    return (
      <BookEditField
        key={value.label}
        book={props.book}
        control={props.control}
        fieldMetadata={value}
        suggestions={suggestions}
      />
    )
  })

  return (
    <Box {...props}>
      <ScrollView>{fields}</ScrollView>
    </Box>
  )
}
