import { Button, VStack } from "@/components"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"
import { BookEditFieldList, type BookEditFieldListProps } from "./BookEditFieldList"

export type FormBookEditFieldListProps = Omit<BookEditFieldListProps, "control"> & {
  onSubmit: (data: MetadataSnapshotIn) => void
}
export function FormBookEditFieldList(props: FormBookEditFieldListProps) {
  const form = useForm<MetadataSnapshotIn, unknown, MetadataSnapshotIn>({
    defaultValues: props.book.metaData
      ? (getSnapshot(props.book.metaData) as MetadataSnapshotIn)
      : undefined,
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
