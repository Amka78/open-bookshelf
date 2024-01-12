import { translate } from "@/i18n"
import { SortField } from "@/models/CarlibreRootStore"
import { Menu, MenuItem, MenuItemLabel } from "@gluestack-ui/themed"
import React from "react"
import { IconButton } from "@/components"

export type SortMenuProps = {
  selectedSort: string
  selectedSortOrder: string
  field: SortField[]
  onSortChange: (sortId: string) => void
}
export function SortMenu(props: SortMenuProps) {
  return (
    <Menu
      //w="190"
      placement="left"
      trigger={(triggerProps) => {
        return <IconButton {...triggerProps} name="sort" iconSize="md-" variant="staggerChild" />
      }}
    >
      {props.field.map((value) => {
        const text =
          value.id === props.selectedSort
            ? `${value.name}-${translate(
                props.selectedSortOrder === "asc" ? "sortMenu.asc" : "sortMenu.desc",
              )}`
            : value.name
        return (
          <MenuItem key={value.id} textValue={value.id} id={value.id}>
            <MenuItemLabel>{text}</MenuItemLabel>
          </MenuItem>
        )
      })}
    </Menu>
  )
}
