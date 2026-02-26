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
import { useRomajiText } from "@/hooks/useRomajiText"
import type { Book, FieldMetadata, Metadata } from "@/models/calibre"
import type { ComponentProps } from "react"
import { useController, type Control, type Path } from "react-hook-form"

export type BookEditFieldProps = {
  book: Book
  fieldMetadata: FieldMetadata
  control: Control<Metadata, unknown>
  suggestions?: string[]
  containerProps?: ComponentProps<typeof VStack>
}

export function BookEditField(props: BookEditFieldProps) {
  let field: React.ReactNode
  const { toSortValue, toAuthorSortValue } = useRomajiText()

  const toSeriesValues = (value: unknown) => {
    const title = String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
    const match = title.match(/^(.*)\s(\d+(?:\.\d+)?)$/)

    if (match) {
      const seriesName = match[1].trim()
      const seriesIndex = Number(match[2])
      return {
        series: seriesName.length > 0 ? seriesName : null,
        seriesIndex,
      }
    }

    return {
      series: title.length > 0 ? title : null,
      seriesIndex: null,
    }
  }

  const label = props.fieldMetadata.label as Path<Metadata>
  const authorsController = useController({
    control: props.control,
    name: "authors" as Path<Metadata>,
  })
  const authorSortController = useController({
    control: props.control,
    name: "authorSort" as Path<Metadata>,
  })
  const titleController = useController({
    control: props.control,
    name: "title" as Path<Metadata>,
  })
  const sortController = useController({
    control: props.control,
    name: "sort" as Path<Metadata>,
  })
  const seriesController = useController({
    control: props.control,
    name: "series" as Path<Metadata>,
  })
  const seriesIndexController = useController({
    control: props.control,
    name: "seriesIndex" as Path<Metadata>,
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
      ) : props.fieldMetadata.label === "title" ? (
        <HStack alignItems="center" space={"xs"}>
          <Text isTruncated={true} fontWeight="$bold">
            {props.fieldMetadata.name}
          </Text>
          <TooltipIconButton
            name="sort-alphabetical-ascending"
            iconSize="sm"
            tooltipTx="bookEditScreen.titleSortAutoTooltip"
            onPress={() => {
              const converted = toSortValue(titleController.field.value)
              sortController.field.onChange(converted)
            }}
          />
          <TooltipIconButton
            name="format-list-numbered"
            iconSize="sm"
            tooltipTx="bookEditScreen.titleSeriesAutoTooltip"
            onPress={() => {
              const converted = toSeriesValues(titleController.field.value)
              seriesController.field.onChange(converted.series)
              seriesIndexController.field.onChange(converted.seriesIndex)
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
