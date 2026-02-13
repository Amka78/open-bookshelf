import { HStack, IconButton } from "@/components"
import type { HStackProps, IconButtonProps } from "@/components"

export type BookDetailMenuProps = {
  onOpenBook: () => Promise<void>
  onDownloadBook: () => void
  onConvertBook: () => void
  onEditBook: () => void
  onDeleteBook: () => void
  iconOpacity?: number
  containerProps?: HStackProps
  iconButtonProps?: Partial<IconButtonProps>
}
export function BookDetailMenu(props: BookDetailMenuProps) {
  const iconButtonStyle =
    typeof props.iconOpacity === "number" ? { opacity: props.iconOpacity } : undefined
  const sharedIconButtonProps = {
    ...props.iconButtonProps,
    style: [props.iconButtonProps?.style, iconButtonStyle],
  }
  return (
    <HStack bgColor="transparent" {...props.containerProps}>
      <IconButton
        {...sharedIconButtonProps}
        name={"book-open"}
        iconSize="md-"
        onPress={props.onOpenBook}
      />
      <IconButton
        {...sharedIconButtonProps}
        name={"download"}
        iconSize="md-"
        onPress={props.onDownloadBook}
      />
      <IconButton
        {...sharedIconButtonProps}
        name={"sync-circle"}
        iconSize="md-"
        onPress={props.onConvertBook}
      />
      <IconButton
        {...sharedIconButtonProps}
        name={"book-edit"}
        iconSize="md-"
        onPress={props.onEditBook}
      />
      <IconButton
        {...sharedIconButtonProps}
        name={"trash-can"}
        iconSize="md-"
        onPress={props.onDeleteBook}
      />
    </HStack>
  )
}
