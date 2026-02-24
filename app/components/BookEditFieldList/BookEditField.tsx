import {
  FormDateTimePicker,
  FormInputField,
  FormMultipleInputField,
  FormRatingGroup,
  HStack,
  Input,
  Text,
  TooltipIconButton,
  VStack,
} from "@/components"
import type { Book, FieldMetadata, Metadata } from "@/models/calibre"
import type { ComponentProps } from "react"
import { useController, type Control, type Path } from "react-hook-form"
import * as transliterationModule from "transliteration"

function resolveTransliterate() {
  const candidate = transliterationModule as {
    transliterate?: unknown
    default?: unknown
  }

  if (typeof candidate.transliterate === "function") {
    return candidate.transliterate as (value: string) => string
  }

  if (typeof candidate.default === "function") {
    return candidate.default as (value: string) => string
  }

  if (
    typeof candidate.default === "object" &&
    candidate.default !== null &&
    "transliterate" in candidate.default &&
    typeof (candidate.default as { transliterate?: unknown }).transliterate === "function"
  ) {
    return (candidate.default as { transliterate: (value: string) => string }).transliterate
  }

  return (value: string) => value
}

const transliterate = resolveTransliterate()

function toRomajiText(value: string) {
  return transliterate(value).replace(/\s+/g, " ").trim()
}

function toAuthorSortValue(authorsValue: unknown) {
  const source = Array.isArray(authorsValue)
    ? authorsValue
    : typeof authorsValue === "string"
      ? [authorsValue]
      : []

  const converted = source
    .map((entry) => toRomajiText(String(entry ?? "")))
    .filter((entry) => entry.length > 0)
    .join(" & ")

  return converted.length > 0 ? converted : null
}

export type BookEditFieldProps = {
  book: Book
  fieldMetadata: FieldMetadata
  control: Control<Metadata, unknown>
  suggestions?: string[]
  containerProps?: ComponentProps<typeof VStack>
}

export function BookEditField(props: BookEditFieldProps) {
  let field: React.ReactNode

  const label = props.fieldMetadata.label as Path<Metadata>
  const authorsController = useController({
    control: props.control,
    name: "authors" as Path<Metadata>,
  })
  const authorSortController = useController({
    control: props.control,
    name: "authorSort" as Path<Metadata>,
  })

  switch (props.fieldMetadata.datatype) {
    case "rating":
      field = <FormRatingGroup control={props.control} name={label} max={10} />
      break
    case "int":
    case "float":
      field = (
        <Input>
          <FormInputField control={props.control} name={label} inputMode="numeric" />
        </Input>
      )
      break
    case "datetime":
      field = (
        <FormDateTimePicker
          control={props.control}
          name={label}
          dateFormat={props.fieldMetadata.display.dateFormat}
        />
      )
      break
    case "text":
      if (props.fieldMetadata.isMultiple) {
        field = (
          <FormMultipleInputField
            control={props.control}
            name={label}
            textToValue={props.fieldMetadata.isMultiple.uiToList}
            valueToText={props.fieldMetadata.isMultiple.listToUi}
            suggestions={props.suggestions}
            width={"$full"}
          />
        )
      } else {
        field = (
          <Input height={"$8"} width={"$full"}>
            <FormInputField
              control={props.control}
              name={label}
              suggestions={props.suggestions}
              width={"$full"}
            />
          </Input>
        )
      }
      break
    default:
      break
  }
  return (
    <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"} {...props.containerProps}>
      {props.fieldMetadata.label === "authors" ? (
        <HStack alignItems="center" space={"xs"}>
          <Text isTruncated={true} fontWeight="$bold">
            {props.fieldMetadata.name}
          </Text>
          <TooltipIconButton
            name="sort-alphabetical-ascending"
            iconSize="sm"
            tooltipTx="bookEditScreen.authorSortAutoTooltip"
            onPress={() => {
              const converted = toAuthorSortValue(authorsController.field.value)
              authorSortController.field.onChange(converted)
            }}
          />
        </HStack>
      ) : (
        <Text isTruncated={true} fontWeight="$bold">
          {props.fieldMetadata.name}
        </Text>
      )}
      {field}
    </VStack>
  )
}
