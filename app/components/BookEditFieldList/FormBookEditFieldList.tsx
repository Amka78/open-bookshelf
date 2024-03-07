import { Button, VStack } from "@/components"
import { BookEditFieldList, BookEditFieldListProps } from "./BookEditFieldList"
import { useForm } from "react-hook-form"
import { Metadata } from "@/models/calibre"

export type FormBookEditFieldListProps = Omit<BookEditFieldListProps, "control"> & {
  onSubmit: (data: Metadata) => void
}
export function FormBookEditFieldList(props: FormBookEditFieldListProps) {
  const form = useForm<Metadata, unknown, Metadata>({
    defaultValues: props.book.metaData,
  })
  return (
    <VStack>
      <BookEditFieldList {...props} control={form.control} />
      <Button
        onPress={form.handleSubmit((value) => {
          props.onSubmit(value)
        })}
      >
        {"Edit Test"}
      </Button>
    </VStack>
  )
}
