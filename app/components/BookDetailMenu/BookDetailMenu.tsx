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
  onOpenBookDetail: () => void
  onShareLink?: () => void
  onSendByEmail?: () => void
  readStatus?: ReadStatusValue | null
  onSetStatus?: (status: ReadStatusValue | null) => void
  iconOpacity?: number
  containerProps?: HStackProps
  iconButtonProps?: Partial<IconButtonProps>
  wrap?: boolean
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

  const iconSize = props.wrap ? "sm" : "md-"

  return (
    <HStack
      bgColor="transparent"
      flexWrap={props.wrap ? "wrap" : undefined}
      maxWidth={props.wrap ? 280 : undefined}
      justifyContent={props.wrap ? "center" : undefined}
      {...props.containerProps}
    >
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-open"}
        iconSize={iconSize}
        onPress={props.onOpenBook}
        testID="book-detail-open-button"
        tooltipTx="bookDetailMenu.openBookTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"download"}
        iconSize={iconSize}
        onPress={props.onDownloadBook}
        testID="book-detail-download-button"
        tooltipTx="bookDetailMenu.downloadTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"information-outline"}
        iconSize={iconSize}
        onPress={props.onOpenBookDetail}
        testID="book-detail-info-button"
        tooltipTx="bookDetailMenu.bookDetailTooltip"
      />
      {props.onShareLink != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"share-variant"}
          iconSize={iconSize}
          onPress={props.onShareLink}
          testID="book-detail-share-button"
          tooltipTx="bookDetailMenu.shareLinkTooltip"
        />
      )}
      {props.onSendByEmail != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"email-edit-outline"}
          iconSize={iconSize}
          onPress={props.onSendByEmail}
          testID="book-detail-send-email-button"
          tooltipTx="emailDelivery.buttonTooltip"
        />
      )}
      {props.onSetStatus != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={statusIconName}
          iconSize={iconSize}
          onPress={handleCycleStatus}
          testID="book-detail-status-button"
          tooltipTx="bookDetailMenu.setStatusTooltip"
        />
      )}
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"sync-circle"}
        iconSize={iconSize}
        onPress={props.onConvertBook}
        testID="book-detail-convert-button"
        tooltipTx="bookDetailMenu.convertTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-edit"}
        iconSize={iconSize}
        onPress={props.onEditBook}
        testID="book-detail-edit-button"
        tooltipTx="bookDetailMenu.editTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"trash-can"}
        iconSize={iconSize}
        onPress={props.onDeleteBook}
        testID="book-detail-delete-button"
        tooltipTx="bookDetailMenu.deleteTooltip"
      />
    </HStack>
  )
}
