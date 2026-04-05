import { type MessageKey, translate } from "@/i18n"
import type { BookReadingStyleType } from "@/type/types"
import {
  Menu,
  MenuItem,
  MenuItemLabel as MenuItemLabelOrigin,
  Pressable,
  VStack as VStackOrigin,
} from "@gluestack-ui/themed"
import type { ComponentProps } from "react"

import { HStack, IconButton, MaterialCommunityIcon, Text, TooltipIconButton } from "@/components"
import { AutoPageTurningIconButton } from "@/components/AutoPageTurningIconButton"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { usePalette } from "@/theme"
import { useModal } from "react-native-modalfy"
import { useViewerMenuState } from "./useViewerMenuState"

export type ViewerMenuProps = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection) => void
  onSelectCurrentPageAsCover?: () => void
  onSelectLeftPageAsCover?: () => void
  onSelectRightPageAsCover?: () => void
  autoPageTurning: boolean
  autoPageTurnIntervalMs: number
  onToggleAutoPageTurning?: () => void
  onAutoPageTurnIntervalChange?: (intervalMs: number) => void
  onAddBookmark?: () => void
  onToggleAnnotationPanel?: () => void
}

type MenuItemLabelProps = ComponentProps<typeof MenuItemLabelOrigin> & {
  tx: MessageKey
  descriptionTx?: MessageKey
}
function MenuItemLabel(props: MenuItemLabelProps) {
  const palette = usePalette()
  const { tx, descriptionTx, children } = props
  return (
    <VStackOrigin>
      <MenuItemLabelOrigin>{tx ? translate(tx) : children}</MenuItemLabelOrigin>
      {descriptionTx ? (
        <Text fontSize={"$xs"} color={palette.textSecondary}>
          {translate(descriptionTx)}
        </Text>
      ) : null}
    </VStackOrigin>
  )
}
export function ViewerMenu(props: ViewerMenuProps) {
  const convergenceHook = useConvergence()
  const modal = useModal<ModalStackParams>()
  const { pageDirectionState, readingStyleState, onUpdateReadingStyle, onTogglePageDirection } =
    useViewerMenuState({
      pageDirection: props.pageDirection,
      readingStyle: props.readingStyle,
      onSelectReadingStyle: props.onSelectReadingStyle,
      onSelectPageDirection: props.onSelectPageDirection,
    })

  return (
    <HStack gap="$3">
      <Menu
        placement="bottom right"
        trigger={(triggerProps) => {
          return (
            <Pressable {...triggerProps} testID="viewer-book-settings-trigger">
              <IconButton
                iconSize="md-"
                name="book-settings"
                labelTx={
                  convergenceHook.isLarge
                    ? (`bookReadingStyle.${readingStyleState}` as MessageKey)
                    : undefined
                }
                pressable={false}
              />
            </Pressable>
          )
        }}
      >
        <MenuItem textValue="singlePage" onPress={() => onUpdateReadingStyle("singlePage")}>
          <MenuItemLabel
            tx={"bookReadingStyle.singlePage"}
            descriptionTx="bookReadingStyle.singlePageDescription"
          />
        </MenuItem>
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem textValue="facingPage" onPress={() => onUpdateReadingStyle("facingPage")}>
            <MenuItemLabel
              tx="bookReadingStyle.facingPage"
              descriptionTx="bookReadingStyle.facingPageDescription"
            />
          </MenuItem>
        ) : null}
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem
            textValue="facingPageWithTitle"
            onPress={() => onUpdateReadingStyle("facingPageWithTitle")}
          >
            <MenuItemLabel
              tx="bookReadingStyle.facingPageWithTitle"
              descriptionTx="bookReadingStyle.facingPageWithTitleDescription"
            />
          </MenuItem>
        ) : null}
        <MenuItem
          textValue={"verticalScroll"}
          onPress={() => onUpdateReadingStyle("verticalScroll")}
        >
          <MenuItemLabel
            tx="bookReadingStyle.verticalScroll"
            descriptionTx="bookReadingStyle.verticalScrollDescription"
          />
        </MenuItem>
      </Menu>

      {props.readingStyle !== "verticalScroll" ? (
        <TooltipIconButton
          name={`arrow-${pageDirectionState}-bold`}
          iconSize={"md-"}
          tooltipTx={
            (pageDirectionState === "left"
              ? "pageDirection.leftToRight"
              : "pageDirection.rightToLeft") as MessageKey
          }
          onPress={() => {
            console.tron.log(`current page direction: ${pageDirectionState}`)
            const direction = onTogglePageDirection()
            console.tron.log(`next page direction: ${direction}`)
          }}
        />
      ) : null}

      <AutoPageTurningIconButton
        isActive={props.autoPageTurning}
        onPress={props.onToggleAutoPageTurning}
        iconSize="md-"
        tooltipTx={
          (props.autoPageTurning
            ? "autoPageTurning.tooltipActive"
            : "autoPageTurning.tooltipInactive") as MessageKey
        }
      />
      <IconButton
        name="cog-outline"
        iconSize="md-"
        onPress={() => {
          modal.openModal("ViewerAutoPageTurnSettingModal", {
            intervalMs: props.autoPageTurnIntervalMs,
            onSave: (intervalMs) => {
              props.onAutoPageTurnIntervalChange?.(intervalMs)
            },
          })
        }}
      />

      <Menu
        placement="bottom right"
        trigger={(triggerProps) => {
          return (
            <Pressable {...triggerProps} testID="viewer-cover-settings-trigger">
              <IconButton iconSize="md-" name="image" pressable={false} />
            </Pressable>
          )
        }}
      >
        {props.onSelectCurrentPageAsCover ? (
          <MenuItem textValue="setCurrentPageAsCover" onPress={props.onSelectCurrentPageAsCover}>
            <MenuItemLabel tx="viewerMenu.setCurrentPageAsCover" />
          </MenuItem>
        ) : null}
        {props.onSelectLeftPageAsCover ? (
          <MenuItem textValue="setLeftPageAsCover" onPress={props.onSelectLeftPageAsCover}>
            <MenuItemLabel tx="viewerMenu.setLeftPageAsCover" />
          </MenuItem>
        ) : null}
        {props.onSelectRightPageAsCover ? (
          <MenuItem textValue="setRightPageAsCover" onPress={props.onSelectRightPageAsCover}>
            <MenuItemLabel tx="viewerMenu.setRightPageAsCover" />
          </MenuItem>
        ) : null}
      </Menu>

      {props.onAddBookmark ? (
        <TooltipIconButton
          name="bookmark-plus-outline"
          iconSize="md-"
          tooltipTx="viewerMenu.addBookmark"
          onPress={props.onAddBookmark}
        />
      ) : null}

      {props.onToggleAnnotationPanel ? (
        <TooltipIconButton
          name="format-list-bulleted"
          iconSize="md-"
          tooltipTx="viewerMenu.showAnnotations"
          onPress={props.onToggleAnnotationPanel}
        />
      ) : null}
    </HStack>
  )
}
