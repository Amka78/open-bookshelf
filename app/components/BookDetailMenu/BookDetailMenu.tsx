import { HStack, IconButton } from "@/components"

export type BookDetailMenuProps = {
  onOpenBook: () => Promise<void>
  onDownloadBook: () => void
  onConvertBook: () => void
  onEditBook: () => void
  onDeleteBook: () => void
}
export function BookDetailMenu(props: BookDetailMenuProps) {
  return (
    <HStack>
      <IconButton name={"book-open"} iconSize="md-" onPress={props.onOpenBook} />
      <IconButton name={"download"} iconSize="md-" onPress={props.onDownloadBook} />
      <IconButton name={"sync-circle"} iconSize="md-" onPress={props.onConvertBook} />
      <IconButton name={"book-edit"} iconSize="md-" onPress={props.onEditBook} />
      <IconButton name={"trash-can"} iconSize="md-" onPress={props.onDeleteBook} />
    </HStack>
  )
}
