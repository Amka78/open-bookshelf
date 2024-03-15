import Picker from "@react-native-community/datetimepicker"
import { HStack, IconButton, Text } from "@/components"
import { useState } from "react"
import { formatDate } from "@/utils/formatDate"
import { parseISO } from "date-fns"

export type DateTimePickerProps = {
  value: string
  onChange: (date: string) => void
  dateFormat: string
}
export function DateTimePicker(props: DateTimePickerProps) {
  const [show, setShow] = useState(false)
  console.log(props.value)
  console.log(props.dateFormat)
  return (
    <>
      <HStack>
        <Text flex={1}>
          {props.value ? formatDate(parseISO(props.value), props.dateFormat) : undefined}
        </Text>
        <IconButton
          name={"calendar"}
          onPress={() => {
            setShow(true)
          }}
        />
      </HStack>
      {show && (
        <Picker
          testID="dateTimePicker"
          value={props.value ? new Date(props.value) : new Date()}
          mode={"date"}
          is24Hour={true}
          onChange={(_, selectedDate) => {
            if (props.onChange) {
              props.onChange(selectedDate.toISOString())
            }
          }}
        />
      )}
    </>
  )
}
