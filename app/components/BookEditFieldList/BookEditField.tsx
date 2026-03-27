import {
  FormFormatField,
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
import type { Book, FieldMetadata, MetadataSnapshotIn } from "@/models/calibre"
import type { ComponentProps } from "react"
import { type Control, type Path, useController } from "react-hook-form"

export type BookEditFieldProps = {
  book: Book
  fieldMetadata: FieldMetadata
  control: Control<MetadataSnapshotIn, unknown>
  suggestions?: string[]
  onUploadFormat?: (params: { targetFormat?: string }) => Promise<{ success: boolean; format?: string }>
  onDeleteFormat?: (format: string) => Promise<boolean>
  onTextInputFocus?: () => void
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

  const label = props.fieldMetadata.label as Path<MetadataSnapshotIn>
  const authorsController = useController({
    control: props.control,
    name: "authors" as Path<MetadataSnapshotIn>,
  })
  const authorSortController = useController({
    control: props.control,
    name: "authorSort" as Path<MetadataSnapshotIn>,
  })
  const titleController = useController({
    control: props.control,
    name: "title" as Path<MetadataSnapshotIn>,
  })
  const sortController = useController({
    control: props.control,
    name: "sort" as Path<MetadataSnapshotIn>,
  })
  const seriesController = useController({
    control: props.control,
    name: "series" as Path<MetadataSnapshotIn>,
  })
  const seriesIndexController = useController({
    control: props.control,
    name: "seriesIndex" as Path<MetadataSnapshotIn>,
  })

  switch (props.fieldMetadata.datatype) {
    case "rating":
      field = <FormRatingGroup control={props.control} name={label} max={10} />
      break
    case "int":
    case "float":
      field = (
        <Input>
          <FormInputField
            control={props.control}
            name={label}
            inputMode="numeric"
            onInputFocus={props.onTextInputFocus}
          />
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
      if (props.fieldMetadata.label === "formats") {
        field = (
          <FormFormatField
            control={props.control}
            name={label}
            onUploadFormat={props.onUploadFormat}
            onDeleteFormat={props.onDeleteFormat}
            testID={`book-edit-${String(label)}`}
          />
        )
      } else if (props.fieldMetadata.isMultiple) {
        field = (
          <FormMultipleInputField
            control={props.control}
            name={label}
            textToValue={props.fieldMetadata.isMultiple.uiToList}
            valueToText={props.fieldMetadata.isMultiple.listToUi}
            suggestions={props.suggestions}
            onInputFocus={props.onTextInputFocus}
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
              onInputFocus={props.onTextInputFocus}
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
