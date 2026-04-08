import { HStack, TooltipIconButton } from "@/components"
import type { MaterialCommunityIconProps } from "@/components"
import type { HStackProps, IconButtonProps } from "@/components"
import { StyleSheet } from "react-native"

type IconName = MaterialCommunityIconProps["name"]
type ReadStatusValue = "want-to-read" | "reading" | "finished"

const STATUS_CYCLE: (ReadStatusValue | null)[] = [null, "want-to-read", "reading", "finished"]

const STATUS_ICON_MAP: Record<ReadStatusValue, IconName> = {
  "want-to-read": "bookmark-outline",
  reading: "book-open-outline",
  finished: "check-circle-outline",
}

export type BookDetailMenuProps = {
  onOpenBook: () => Promise<void>
  onDownloadBook: () => void
  onConvertBook: () => void
  onEditBook: () => void
  onDeleteBook: () => void
  onShareLink?: () => void
  onSendByEmail?: () => void
  readStatus?: ReadStatusValue | null
  onSetStatus?: (status: ReadStatusValue | null) => void
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

  const handleCycleStatus = () => {
    if (!props.onSetStatus) return
    const currentIdx = STATUS_CYCLE.indexOf(props.readStatus ?? null)
    const nextIdx = (currentIdx + 1) % STATUS_CYCLE.length
    props.onSetStatus(STATUS_CYCLE[nextIdx])
  }

  const statusIconName: IconName = props.readStatus
    ? STATUS_ICON_MAP[props.readStatus]
    : "bookmark-plus-outline"

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
      {props.onShareLink != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"share-variant"}
          iconSize="md-"
          onPress={props.onShareLink}
          testID="book-detail-share-button"
          tooltipTx="bookDetailMenu.shareLinkTooltip"
        />
      )}
      {props.onSendByEmail != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"email-edit-outline"}
          iconSize="md-"
          onPress={props.onSendByEmail}
          testID="book-detail-send-email-button"
          tooltipTx="emailDelivery.buttonTooltip"
        />
      )}
      {props.onSetStatus != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={statusIconName}
          iconSize="md-"
          onPress={handleCycleStatus}
          testID="book-detail-status-button"
          tooltipTx="bookDetailMenu.setStatusTooltip"
        />
      )}
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
