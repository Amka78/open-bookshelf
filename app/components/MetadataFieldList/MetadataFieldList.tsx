import { ScrollView } from "react-native-gesture-handler"
import { MetadataField } from "../MetadataField/MetadataField"
import { FieldMetadataMap } from "@/models/calibre"
import { Book } from "@/models/CalibreRootStore"
import { Box } from "@/components"
import { ComponentProps } from "react"

export type MetadataFieldListProps = {
  fieldNameList: string[]
  fieldMetadataList: FieldMetadataMap
  book: Book
  onFieldPress: (fieldValue: string) => void
} & ComponentProps<typeof Box>

const ExcludeFields = ["title", "sort"]

export function MetadataFieldList(props: MetadataFieldListProps) {
  return (
    <Box {...props}>
      <ScrollView>
        {props.fieldNameList.map((fieldName) => {
          const fieldMetadata = props.fieldMetadataList.get(fieldName)
          const value = props.book.metaData[fieldName]

          return fieldMetadata?.name &&
            value &&
            value?.length !== 0 &&
            !ExcludeFields.includes(fieldName) ? (
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
