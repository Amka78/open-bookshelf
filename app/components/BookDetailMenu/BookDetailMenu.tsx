import { HStack } from "../HStack/HStack"
import type { HStackProps } from "../HStack/HStack"
import type { IconButtonProps } from "../IconButton/IconButton"
import type { MaterialCommunityIconProps } from "../MaterialCommunityIcon/MaterialCommunityIcon"
import { TooltipIconButton } from "../TooltipIconButton/TooltipIconButton"
import { StyleSheet } from "react-native"

type IconName = MaterialCommunityIconProps["name"]

export type BookDetailMenuProps = {
  onOpenBook: () => Promise<void>
  onDownloadBook: () => void
  onConvertBook: () => void
  onEditBook: () => void
  onRunCoverOcr?: () => void
  onDeleteBook: () => void
  /** 未指定なら「詳細を表示」ボタン自体を描画しない（詳細画面・詳細モーダルでは渡さない）。 */
  onOpenBookDetail?: () => void
  onShareLink?: () => void
  onSendByEmail?: () => void
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

  const iconSize = props.wrap ? "md" : "md-"
  const wrapMenuAction = (action: () => void | Promise<void>) => {
    return async (event?: { stopPropagation?: () => void; preventDefault?: () => void }) => {
      event?.stopPropagation?.()
      event?.preventDefault?.()
      await action()
    }
  }

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
        onPress={wrapMenuAction(props.onOpenBook)}
        testID="book-detail-open-button"
        tooltipTx="bookDetailMenu.openBookTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"download"}
        iconSize={iconSize}
        onPress={wrapMenuAction(props.onDownloadBook)}
        testID="book-detail-download-button"
        tooltipTx="bookDetailMenu.downloadTooltip"
      />
      {props.onOpenBookDetail != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"information-outline"}
          iconSize={iconSize}
          onPress={wrapMenuAction(props.onOpenBookDetail)}
          testID="book-detail-info-button"
          tooltipTx="bookDetailMenu.bookDetailTooltip"
        />
      )}
      {props.onShareLink != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"share-variant"}
          iconSize={iconSize}
          onPress={wrapMenuAction(props.onShareLink)}
          testID="book-detail-share-button"
          tooltipTx="bookDetailMenu.shareLinkTooltip"
        />
      )}
      {props.onSendByEmail != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"email-edit-outline"}
          iconSize={iconSize}
          onPress={wrapMenuAction(props.onSendByEmail)}
          testID="book-detail-send-email-button"
          tooltipTx="emailDelivery.buttonTooltip"
        />
      )}
      {props.onSetStatus != null && (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={statusIconName}
          iconSize={iconSize}
          onPress={wrapMenuAction(handleCycleStatus)}
          testID="book-detail-status-button"
          tooltipTx="bookDetailMenu.setStatusTooltip"
        />
      )}
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"sync-circle"}
        iconSize={iconSize}
        onPress={wrapMenuAction(props.onConvertBook)}
        testID="book-detail-convert-button"
        tooltipTx="bookDetailMenu.convertTooltip"
      />
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"book-edit"}
        iconSize={iconSize}
        onPress={wrapMenuAction(props.onEditBook)}
        testID="book-detail-edit-button"
        tooltipTx="bookDetailMenu.editTooltip"
      />
      {props.onRunCoverOcr ? (
        <TooltipIconButton
          {...sharedIconButtonProps}
          name={"text-box-search-outline"}
          iconSize={iconSize}
          onPress={wrapMenuAction(props.onRunCoverOcr)}
          testID="book-detail-ocr-button"
          tooltipTx="bookDetailMenu.ocrTooltip"
        />
      ) : null}
      <TooltipIconButton
        {...sharedIconButtonProps}
        name={"trash-can"}
        iconSize={iconSize}
        onPress={wrapMenuAction(props.onDeleteBook)}
        testID="book-detail-delete-button"
        tooltipTx="bookDetailMenu.deleteTooltip"
      />
    </HStack>
  )
}
