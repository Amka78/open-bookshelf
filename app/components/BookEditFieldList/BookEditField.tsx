import {
  FormDateTimePicker,
  FormInputField,
  FormMultipleInputField,
  FormRatingGroup,
  Input,
  Text,
  VStack,
} from "@/components"
import type { Book, FieldMetadata, Metadata } from "@/models/calibre"
import type { Control } from "react-hook-form"

export type BookEditFieldProps = {
  book: Book
  fieldMetadata: FieldMetadata
  control: Control<Metadata, unknown>
  suggestions?: string[]
}

export function BookEditField(props: BookEditFieldProps) {
  let field: React.ReactNode

  const label = props.fieldMetadata.label
  switch (props.fieldMetadata.datatype) {
    case "rating":
      field = <FormRatingGroup control={props.control} name={label} max={10} />
      break
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
          <Input height={"$8"} width={"$full"}>
            <FormMultipleInputField
              control={props.control}
              name={label}
              textToValue={props.fieldMetadata.isMultiple.uiToList}
              valueToText={props.fieldMetadata.isMultiple.listToUi}
              suggestions={props.suggestions}
              width={"$full"}
            />
          </Input>
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
    <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"}>
      <Text isTruncated={true} fontWeight="$bold">
        {props.fieldMetadata.name}
      </Text>
      {field}
    </VStack>
  )
}
