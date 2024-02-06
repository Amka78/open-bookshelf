import { ScrollView } from "react-native-gesture-handler"
import { MetadataField } from "../MetadataField/MetadataField"
import { FieldMetadata } from "@/models/calibre"
import { Library } from "@/models/CalibreRootStore"
import { Box } from "@/components"
import { ComponentProps } from "react"

export type MetadataFieldListProps = {
  fieldNameList: string[]
  fieldMetadataList: FieldMetadata[]
  book: Library
  onFieldPress: (fieldValue: string) => void
} & ComponentProps<typeof Box>

const ExcludeFields = ["title", "sort"]

export function MetadataFieldList(props: MetadataFieldListProps) {
  return (
    <Box {...props}>
      <ScrollView>
        {props.fieldNameList.map((fieldName) => {
          const fieldMetadata = props.fieldMetadataList.find((value) => {
            return value.label === fieldName
          })
          const value = props.book.metaData[fieldMetadata?.label]

          return fieldMetadata?.name &&
            value &&
            value?.length !== 0 &&
            !ExcludeFields.includes(fieldMetadata?.label) ? (
            <MetadataField
              value={value}
              fieldMetadata={fieldMetadata}
              onLinkPress={props.onFieldPress}
            />
          ) : undefined
        })}
      </ScrollView>
    </Box>
  )
}
