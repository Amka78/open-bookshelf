import { HStack, Text, LinkButton } from "@/components"
import { FieldMetadata } from "@/models/calibre"
import { formatDate } from "@/utils/formatDate"
import { parseISO } from "date-fns"

export type MetadataFieldProps = {
  value: string | string[] | number | Date
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
      field = (
        <LinkButton
          onPress={(linkName) => {
            onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
          }}
        >
          {{
            value: (props.value as string).split("T")[0],
            label: formatDate(
              parseISO(props.value as string),
              props.fieldMetadata.display.dateFormat,
            ),
          }}
        </LinkButton>
      )
      break
    }
    case "text":
      field = (
        <LinkButton
          onPress={(linkName) => {
            onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
          }}
        >
          {{ value: props.value as string }}
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
          {{ value: props.value as string }}
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
