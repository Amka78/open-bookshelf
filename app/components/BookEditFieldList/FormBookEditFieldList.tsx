import { Button, VStack } from "@/components"
import type { Metadata } from "@/models/calibre"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"
import { BookEditFieldList, type BookEditFieldListProps } from "./BookEditFieldList"

export type FormBookEditFieldListProps = Omit<BookEditFieldListProps, "control"> & {
  onSubmit: (data: Metadata) => void
}
export function FormBookEditFieldList(props: FormBookEditFieldListProps) {
  const form = useForm<Metadata, unknown, Metadata>({
    defaultValues: props.book.metaData ? (getSnapshot(props.book.metaData) as Metadata) : undefined,
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
