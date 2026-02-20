import { type MessageKey, translate } from "@/i18n"
import type { BookReadingStyleType } from "@/type/types"
import {
  Menu,
  MenuItem,
  MenuItemLabel as MenuItemLabelOrigin,
  Pressable,
  VStack as VStackOrigin,
  Text,
} from "@gluestack-ui/themed"
import { type ComponentProps, useState } from "react"

import { HStack, IconButton, MaterialCommunityIcon, TooltipIconButton } from "@/components"
import { AutoPageTurningIconButton } from "@/components/AutoPageTurningIconButton"
import { useConvergence } from "@/hooks/useConvergence"
import { useModal } from "react-native-modalfy"
import type { ModalStackParams } from "@/components/Modals/Types"

export type ViewerMenuProps = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection) => void
  autoPageTurning: boolean
  autoPageTurnIntervalMs: number
  onToggleAutoPageTurning?: () => void
  onAutoPageTurnIntervalChange?: (intervalMs: number) => void
}

type MenuItemLabelProps = ComponentProps<typeof MenuItemLabelOrigin> & {
  tx: MessageKey
  descriptionTx?: MessageKey
}
function MenuItemLabel(props: MenuItemLabelProps) {
  const { descriptionTx, ...restProps } = props
  return (
    <VStackOrigin {...restProps}>
      <MenuItemLabelOrigin>
        {props.tx ? translate(props.tx) : props.children}
      </MenuItemLabelOrigin>
      {descriptionTx ? (
        <Text fontSize={"$xs"} color="$textSecondary">{translate(descriptionTx)}</Text>
      ) : null}
    </VStackOrigin>
  )
}
export function ViewerMenu(props: ViewerMenuProps) {
  const [pageDirectionState, setPageDirectionState] = useState(props.pageDirection)
  const [readingStyleState, setReadingStyleState] = useState(props.readingStyle)

  const convergenceHook = useConvergence()
  const modal = useModal<ModalStackParams>()
  const onUpdateReadingStyle = (readingStyle: BookReadingStyleType) => {
    props.onSelectReadingStyle(readingStyle)
    setReadingStyleState(readingStyle)
  }

  return (
    <HStack gap="$3">
      <Menu
        placement="bottom"
        trigger={(triggerProps) => {
          return (
            <Pressable {...triggerProps}>
              <MaterialCommunityIcon
                iconSize="md-"
                name="book-settings"
                labelTx={
                  convergenceHook.isLarge
                    ? (`bookReadingStyle.${readingStyleState}` as MessageKey)
                    : undefined
                }
              />
            </Pressable>
          )
        }}
      >
        <MenuItem 
          textValue="singlePage" 
          onPress={() => onUpdateReadingStyle("singlePage")}
        >
          <MenuItemLabel tx={"bookReadingStyle.singlePage"} descriptionTx="bookReadingStyle.singlePageDescription" />
        </MenuItem>
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem 
            textValue="facingPage" 
            onPress={() => onUpdateReadingStyle("facingPage")}
          >
            <MenuItemLabel tx="bookReadingStyle.facingPage" descriptionTx="bookReadingStyle.facingPageDescription" />
          </MenuItem>
        ) : null}
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem
            textValue="facingPageWithTitle"
            onPress={() => onUpdateReadingStyle("facingPageWithTitle")}
          >
            <MenuItemLabel tx="bookReadingStyle.facingPageWithTitle" descriptionTx="bookReadingStyle.facingPageWithTitleDescription" />
          </MenuItem>
        ) : null}
        <MenuItem
          textValue={"verticalScroll"}
          onPress={() => onUpdateReadingStyle("verticalScroll")}
        >
          <MenuItemLabel tx="bookReadingStyle.verticalScroll" descriptionTx="bookReadingStyle.verticalScrollDescription" />
        </MenuItem>
      </Menu>
      {props.readingStyle !== "verticalScroll" ? (
        <TooltipIconButton
          name={`arrow-${pageDirectionState}-bold`}
          iconSize={"md-"}
          tooltipTx={(pageDirectionState === "left" ? "pageDirection.leftToRight" : "pageDirection.rightToLeft") as MessageKey}
          onPress={() => {
            console.tron.log(`current page direction: ${pageDirectionState}`)
            const direction = pageDirectionState === "left" ? "right" : "left"
            console.tron.log(`next page direction: ${direction}`)
            props.onSelectPageDirection(direction)
            setPageDirectionState(direction)
          }}
        />
      ) : null}

      <AutoPageTurningIconButton
        isActive={props.autoPageTurning}
        onPress={props.onToggleAutoPageTurning}
        iconSize="md-"
        tooltipTx={(props.autoPageTurning ? "autoPageTurning.tooltipActive" : "autoPageTurning.tooltipInactive") as MessageKey}
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
    </HStack>
  )
}
