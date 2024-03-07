import { Book } from "@/models/CalibreRootStore"
import { FieldMetadata, Metadata } from "@/models/calibre"
import { Control } from "react-hook-form"
import {
  FormRatingGroup,
  VStack,
  Text,
  Input,
  FormInputField,
  FormDateTimePicker,
  FormMultipleInputField,
} from "@/components"

export type BookEditFieldProps = {
  book: Book
  fieldMetadata: FieldMetadata
  control: Control<Metadata, unknown>
}

export function BookEditField(props: BookEditFieldProps) {
  let field: React.ReactNode

  console.log("Edit Field Created.")
  const label = props.fieldMetadata.label as any
  switch (props.fieldMetadata.datatype) {
    case "rating":
      field = <FormRatingGroup control={props.control} name={label} max={10} />
      break
    case "float":
      field = <FormInputField control={props.control} name={label} inputMode="numeric" />
      break
    case "datetime":
      field = <FormDateTimePicker control={props.control} name={label} />
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
              width={"$full"}
            />
          </Input>
        )
      } else {
        field = (
          <Input height={"$8"} width={"$full"}>
            <FormInputField control={props.control} name={label} width={"$full"} />
          </Input>
        )
      }
      break
    default:
      break
  }
  return (
    <VStack
      key={props.fieldMetadata.label}
      alignItems="flex-start"
      space={"sm"}
      marginBottom={"$2.5"}
      height={"$16"}
    >
      <Text isTruncated={true} fontWeight="$bold">
        {props.fieldMetadata.name}
      </Text>
      {field}
    </VStack>
  )
}
