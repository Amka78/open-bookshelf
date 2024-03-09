import { IconButton, MaterialCommunityIcon } from "@/components"
import { translate } from "@/i18n"
import type { SortField } from "@/models/calibre"
import { Menu, MenuItem, MenuItemLabel, Pressable } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
import { useWindowDimensions } from "react-native"

export type SortMenuProps = {
  selectedSort?: string
  selectedSortOrder?: string
  field?: SortField[]
  onSortChange?: (sortId: string) => void
} & ComponentProps<typeof Menu>
export function SortMenu(props: SortMenuProps) {
  const dimension = useWindowDimensions()

  return (
    <Menu
      placement="left bottom"
      trigger={(triggerProps) => {
        return (
          <Pressable {...triggerProps}>
            <MaterialCommunityIcon name="sort" iconSize="md-" variant="staggerChild" />
          </Pressable>
        )
      }}
      closeOnSelect={true}
    >
      {props.field?.map((value) => {
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
