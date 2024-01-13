import { translate } from "@/i18n"
import { SortField } from "@/models/CarlibreRootStore"
import { Menu, MenuItem, MenuItemLabel } from "@gluestack-ui/themed"
import React, { ComponentProps } from "react"
import { IconButton } from "@/components"
import { useWindowDimensions } from "react-native"

export type SortMenuProps = {
  selectedSort: string
  selectedSortOrder: string
  field: SortField[]
  onSortChange: (sortId: string) => void
}
export function SortMenu(props: SortMenuProps) {
  const dimension = useWindowDimensions()

  return (
    <Menu
      placement="left bottom"
      trigger={(triggerProps) => {
        return <IconButton {...triggerProps} name="sort" iconSize="md-" variant="staggerChild" />
      }}
      // :TODO Forced layout adjustments because library settings do not work well.
      // Temporary improvements pending library fixes.
      //marginLeft={"$4/5"}
      position="absolute"
      left={dimension.width - 260}
      closeOnSelect={true}
    >
      {props.field.map((value) => {
        const text =
          value.id === props.selectedSort
            ? `${value.name}-${translate(
                props.selectedSortOrder === "asc" ? "sortMenu.asc" : "sortMenu.desc",
              )}`
            : value.name
        return (
          <MenuItem
            key={value.id}
            textValue={value.id}
            id={value.id}
            onPress={() => {
              props.onSortChange(value.id)
            }}
          >
            <MenuItemLabel>{text}</MenuItemLabel>
          </MenuItem>
        )
      })}
    </Menu>
  )
}
