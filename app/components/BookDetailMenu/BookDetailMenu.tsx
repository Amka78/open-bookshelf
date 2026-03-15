import { HStack, IconButton, TooltipIconButton } from "@/components"
import type { HStackProps, IconButtonProps } from "@/components"
import { StyleSheet } from "react-native"

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
  const baseIconStyle = props.iconButtonProps?.style
  const iconButtonStyle = (() => {
    if (typeof props.iconOpacity !== "number") {
      return baseIconStyle
    }

    if (!baseIconStyle) {
      return { opacity: props.iconOpacity }
    }

    if (typeof baseIconStyle === "function") {
      return baseIconStyle
    }

    return StyleSheet.compose(baseIconStyle, { opacity: props.iconOpacity })
  })()
  const sharedIconButtonProps = {
    ...props.iconButtonProps,
    style: iconButtonStyle,
  }
  return (
    <HStack bgColor="transparent" {...props.containerProps}>
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-open"}
        iconSize="md-"
        onPress={props.onOpenBook}
        testID="book-detail-open-button"
        tooltipTx="bookDetailMenu.openBookTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"download"}
        iconSize="md-"
        onPress={props.onDownloadBook}
        testID="book-detail-download-button"
        tooltipTx="bookDetailMenu.downloadTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"sync-circle"}
        iconSize="md-"
        onPress={props.onConvertBook}
        testID="book-detail-convert-button"
        tooltipTx="bookDetailMenu.convertTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-edit"}
        iconSize="md-"
        onPress={props.onEditBook}
        testID="book-detail-edit-button"
        tooltipTx="bookDetailMenu.editTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"trash-can"}
        iconSize="md-"
        onPress={props.onDeleteBook}
        testID="book-detail-delete-button"
        tooltipTx="bookDetailMenu.deleteTooltip"
      />
    </HStack>
  )
}
