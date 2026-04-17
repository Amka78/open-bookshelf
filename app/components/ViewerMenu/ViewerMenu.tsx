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

import { HStack, IconButton, MaterialCommunityIcon, Text } from "@/components"
import { useConvergence } from "@/hooks/useConvergence"
import { usePalette } from "@/theme"
import { useViewerMenuState } from "./useViewerMenuState"

export type ViewerMenuProps = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection: "left" | "right") => void
  onSelectCurrentPageAsCover?: () => void
  onSelectLeftPageAsCover?: () => void
  onSelectRightPageAsCover?: () => void
  autoPageTurning: boolean
  onToggleAutoPageTurning?: () => void
  onAddBookmark?: () => void
  onToggleAnnotationPanel?: () => void
  onShowToc?: () => void
  onShowReadingSettings?: () => void
}

type MenuItemLabelProps = ComponentProps<typeof MenuItemLabelOrigin> & {
  tx: MessageKey
  descriptionTx?: MessageKey
  selected?: boolean
  selectedTestID?: string
}
function MenuItemLabel(props: MenuItemLabelProps) {
  const palette = usePalette()
  const { tx, descriptionTx, children, selected = false, selectedTestID } = props
  return (
    <HStack width="100%" gap="$3">
      {selected ? (
        <MaterialCommunityIcon name="check" iconSize="sm-" testID={selectedTestID} />
      ) : null}
      <VStackOrigin flex={1}>
        <MenuItemLabelOrigin>{tx ? translate(tx) : children}</MenuItemLabelOrigin>
        {descriptionTx ? (
          <Text fontSize={"$xs"} color={palette.textSecondary}>
            {translate(descriptionTx)}
          </Text>
        ) : null}
      </VStackOrigin>
    </HStack>
  )
}
export function ViewerMenu(props: ViewerMenuProps) {
  const convergenceHook = useConvergence()
  const { pageDirectionState, readingStyleState, onUpdateReadingStyle, onTogglePageDirection } =
    useViewerMenuState({
      pageDirection: props.pageDirection,
      readingStyle: props.readingStyle,
      onSelectReadingStyle: props.onSelectReadingStyle,
      onSelectPageDirection: props.onSelectPageDirection,
    })

  return (
    <Menu
      placement="bottom right"
      trigger={(triggerProps) => {
        return (
          <Pressable {...triggerProps} testID="viewer-overflow-trigger">
            <IconButton iconSize="md-" name="dots-vertical" pressable={false} />
          </Pressable>
        )
      }}
    >
      <MenuItem textValue="singlePage" onPress={() => onUpdateReadingStyle("singlePage")}>
        <MenuItemLabel
          tx={"bookReadingStyle.singlePage"}
          descriptionTx="bookReadingStyle.singlePageDescription"
          selected={readingStyleState === "singlePage"}
          selectedTestID="viewer-reading-style-check-singlePage"
        />
      </MenuItem>
      {convergenceHook.orientation === "horizontal" ? (
        <MenuItem textValue="facingPage" onPress={() => onUpdateReadingStyle("facingPage")}>
          <MenuItemLabel
            tx="bookReadingStyle.facingPage"
            descriptionTx="bookReadingStyle.facingPageDescription"
            selected={readingStyleState === "facingPage"}
            selectedTestID="viewer-reading-style-check-facingPage"
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
            selected={readingStyleState === "facingPageWithTitle"}
            selectedTestID="viewer-reading-style-check-facingPageWithTitle"
          />
        </MenuItem>
      ) : null}
      <MenuItem textValue={"verticalScroll"} onPress={() => onUpdateReadingStyle("verticalScroll")}>
        <MenuItemLabel
          tx="bookReadingStyle.verticalScroll"
          descriptionTx="bookReadingStyle.verticalScrollDescription"
          selected={readingStyleState === "verticalScroll"}
          selectedTestID="viewer-reading-style-check-verticalScroll"
        />
      </MenuItem>

      {readingStyleState !== "verticalScroll" ? (
        <MenuItem
          textValue="togglePageDirection"
          onPress={() => {
            onTogglePageDirection()
          }}
        >
          <MenuItemLabel
            tx={
              (pageDirectionState === "left"
                ? "pageDirection.leftToRight"
                : "pageDirection.rightToLeft") as MessageKey
            }
          />
        </MenuItem>
      ) : null}

      {props.onShowReadingSettings ? (
        <MenuItem textValue="showReadingSettings" onPress={props.onShowReadingSettings}>
          <MenuItemLabel tx="readingSettings.title" />
        </MenuItem>
      ) : null}

      {props.onToggleAutoPageTurning ? (
        <MenuItem textValue="toggleAutoPageTurning" onPress={props.onToggleAutoPageTurning}>
          <MenuItemLabel
            tx="autoPageTurning.tooltip"
            descriptionTx={
              (props.autoPageTurning
                ? "autoPageTurning.tooltipActive"
                : "autoPageTurning.tooltipInactive") as MessageKey
            }
          />
        </MenuItem>
      ) : null}

      {props.onToggleAnnotationPanel ? (
        <MenuItem textValue="toggleAnnotationPanel" onPress={props.onToggleAnnotationPanel}>
          <MenuItemLabel tx="viewerMenu.showAnnotations" />
        </MenuItem>
      ) : null}

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
  )
}
