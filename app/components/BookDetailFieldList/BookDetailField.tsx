import { Box, HStack, LinkButton, LinkInfo, Text, Rating } from "@/components"
import { FieldMetadata } from "@/models/calibre"
import { formatDate } from "@/utils/formatDate"
import { parseISO } from "date-fns"

export type BookDetailFieldProps = {
  value: string | string[] | number | Date
  fieldMetadata: FieldMetadata
  onLinkPress?: (link: string) => void
}

const onLinkPress = (linkName: string, metadata: FieldMetadata, postProcess: (query) => void) => {
  const link = `${metadata.searchTerms[0]}:=${linkName}`

  postProcess(link)
}
export function BookDetailField(props: BookDetailFieldProps) {
  let field: React.ReactNode
  switch (props.fieldMetadata.datatype) {
    case "rating":
      {
        if (typeof props.value === "number") {

          field = (
            <Rating rating={props.value} />
          )
        }
      }
      break
    case "float": {
      if (typeof props.value === "number") {
        const num = props.value / 1000000
        field = <Text>{`${num.toFixed(1)}MB`}</Text>
      }
      break
    }
    case "datetime": {
      if (typeof props.value === "string") {
        field = (
          <LinkButton
            onPress={(linkName) => {
              onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
            }}
          >
            {{
              value: props.value.split("T")[0],
              label: formatDate(parseISO(props.value), props.fieldMetadata.display.dateFormat),
            }}
          </LinkButton>
        )
      }
      break
    }
    default:
      if (typeof props.value === "string" || Array.isArray(props.value)) {
        let linkInfo: LinkInfo | LinkInfo[]

        if (Array.isArray(props.value)) {
          linkInfo = []

          props.value.map((val) => {
            const info: LinkInfo = { value: val }
            const linkInfoArray = linkInfo as LinkInfo[]
            linkInfoArray.push(info)
          })
        } else {
          linkInfo = { value: props.value }
        }
        field = (
          <LinkButton
            onPress={(linkName) => {
              onLinkPress(linkName, props.fieldMetadata, props.onLinkPress)
            }}
            conjunction={props.fieldMetadata.isMultiple?.listToUi}
          >
            {linkInfo}
          </LinkButton>
        )
      }
      break
  }
  return (
    <HStack key={props.fieldMetadata.label} alignItems="flex-start" space="sm">
      <Text width={"$24"} isTruncated={true}>
        {props.fieldMetadata.name}
      </Text>
      <Box width={"$32"} alignItems="flex-start">
        {field}
      </Box>
    </HStack>
  )
}
