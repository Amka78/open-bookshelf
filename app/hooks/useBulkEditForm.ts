import type { Book, MetadataSnapshotIn } from "@/models/calibre"
import { logger } from "@/utils/logger"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"

const NON_EDITABLE_KEYS: (keyof MetadataSnapshotIn)[] = [
  "uuid",
  "cover",
  "lastModified",
  "timestamp",
  "size",
  "sharpFixed",
  "formatSizes",
  "langNames",
  "selectedFormat",
]

function assignSnapshotKey<T, K extends keyof T>(target: Partial<T>, key: K, value: T[K]): void {
  target[key] = value
}

export function computeBulkEditCommonValues(books: Book[]): Partial<MetadataSnapshotIn> {
  if (books.length === 0) return {}

  const snapshots = books.map((book) => {
    if (!book.metaData) return {} as MetadataSnapshotIn
    return getSnapshot(book.metaData) as MetadataSnapshotIn
  })

  const first = snapshots[0]
  const common: Partial<MetadataSnapshotIn> = {}

  for (const key of Object.keys(first) as (keyof MetadataSnapshotIn)[]) {
    if (NON_EDITABLE_KEYS.includes(key)) continue
    const firstVal = JSON.stringify(first[key])
    const allMatch = snapshots.every((snap) => JSON.stringify(snap[key]) === firstVal)
    if (allMatch) {
      assignSnapshotKey(common, key, first[key])
    }
  }

  return common
}

export type UseBulkEditFormOptions = {
  books: Book[]
  libraryId: string
  onSaved?: () => void
}

export function useBulkEditForm({ books, libraryId, onSaved }: UseBulkEditFormOptions) {
  const form = useForm<MetadataSnapshotIn, unknown, MetadataSnapshotIn>({
    defaultValues: computeBulkEditCommonValues(books) as MetadataSnapshotIn,
  })

  const canSave = Object.keys(form.formState.dirtyFields).length > 0

  const submit = form.handleSubmit((value) => {
    logger.debug("Bulk edit dirty fields", form.formState.dirtyFields)

    const editedFields = Object.keys(form.formState.dirtyFields).filter((key) => {
      const v = value[key as keyof MetadataSnapshotIn]
      return v !== null && v !== undefined && v !== ""
    })

    if (editedFields.length === 0) return

    for (const book of books) {
      book.update(libraryId, value, editedFields)
    }

    onSaved?.()
  })

  return { canSave, form, submit }
}
