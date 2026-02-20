import { type MessageKey, translate } from "@/i18n"
import type { BookReadingStyleType } from "@/type/types"
import {
  Menu,
  MenuItem,
  MenuItemLabel as MenuItemLabelOrigin,
  Pressable,
} from "@gluestack-ui/themed"
import { type ComponentProps, useState } from "react"

import { HStack, IconButton, MaterialCommunityIcon } from "@/components"
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
}
function MenuItemLabel(props: MenuItemLabelProps) {
  return (
    <MenuItemLabelOrigin {...props}>
      {props.tx ? translate(props.tx) : props.children}
    </MenuItemLabelOrigin>
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
        <MenuItem textValue="singlePage" onPress={() => onUpdateReadingStyle("singlePage")}>
          <MenuItemLabel tx={"bookReadingStyle.singlePage"} />
        </MenuItem>
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem textValue="facingPage" onPress={() => onUpdateReadingStyle("facingPage")}>
            <MenuItemLabel tx="bookReadingStyle.facingPage" />
          </MenuItem>
        ) : null}
        {convergenceHook.orientation === "horizontal" ? (
          <MenuItem
            textValue="facingPageWithTitle"
            onPress={() => onUpdateReadingStyle("facingPageWithTitle")}
          >
            <MenuItemLabel tx="bookReadingStyle.facingPageWithTitle" />
          </MenuItem>
        ) : null}
        <MenuItem
          textValue={"verticalScroll"}
          onPress={() => onUpdateReadingStyle("verticalScroll")}
        >
          <MenuItemLabel tx="bookReadingStyle.verticalScroll" />
        </MenuItem>
      </Menu>
      {props.readingStyle !== "verticalScroll" ? (
        <IconButton
          name={`arrow-${pageDirectionState}-bold`}
          iconSize={"md-"}
          labelTx={convergenceHook.isLarge ? "pageDirection" : undefined}
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
