import { HStack, Text, LinkButton } from "@/components"
import { FieldMetadata } from "@/models/calibre"
import { formatDate } from "@/utils/formatDate"
export type MetadataFieldProps = {
  value: string | number | Date
  fieldMetadata: FieldMetadata
  onLinkPress?: (link: string) => void
}

const onLinkPress = (linkName: string, metadata: FieldMetadata, postProcess: (query) => void) => {
  const link = `${metadata.searchTerms[0]}:=${linkName}`

  postProcess(link)
}
export function MetadataField(props: MetadataFieldProps) {
  let field
  switch (props.fieldMetadata.datatype) {
    case "float": {
      const num = Number(props.value) / 1000000
      field = <Text>{`${num.toFixed(1)}MB`}</Text>
      break
    }
    case "datetime": {
      field = <Text>{formatDate(props.value as Date, props.fieldMetadata.display.dateFormat)}</Text>
      break
    }
    case "text":
      field = (
        <LinkButton
          onPress={(linkName) => {
            onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
          }}
        >
          {props.value}
        </LinkButton>
      )
      break
    default:
      field = (
        <LinkButton
          onPress={(linkName) => {
            onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
          }}
        >
          {props.value}
        </LinkButton>
      )
      break
  }
  return (
    <HStack key={props.fieldMetadata.label} alignItems="flex-start">
      <Text width={"$24"}>{props.fieldMetadata.name}</Text>
      {field}
    </HStack>
  )
}
