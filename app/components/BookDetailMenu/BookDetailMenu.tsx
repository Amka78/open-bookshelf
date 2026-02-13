import { HStack, IconButton, TooltipIconButton } from "@/components"
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
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-open"}
        iconSize="md-"
        onPress={props.onOpenBook}
        tooltipTx="bookDetailMenu.openBookTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"download"}
        iconSize="md-"
        onPress={props.onDownloadBook}
        tooltipTx="bookDetailMenu.downloadTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"sync-circle"}
        iconSize="md-"
        onPress={props.onConvertBook}
        tooltipTx="bookDetailMenu.convertTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-edit"}
        iconSize="md-"
        onPress={props.onEditBook}
        tooltipTx="bookDetailMenu.editTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"trash-can"}
        iconSize="md-"
        onPress={props.onDeleteBook}
        tooltipTx="bookDetailMenu.deleteTooltip"
      />
    </HStack>
  )
}
