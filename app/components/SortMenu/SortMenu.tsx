import { translate } from "@/i18n"
import { SortField } from "@/models/calibre"
import { Menu, MenuItem, MenuItemLabel } from "@gluestack-ui/themed"
import { IconButton } from "@/components"
import { useWindowDimensions } from "react-native"
import { ComponentProps } from "react"

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
      placement="top"
      trigger={(triggerProps) => {
        return <IconButton {...triggerProps} name="sort" iconSize="md-" variant="staggerChild" />
      }}
      // :TODO Forced layout adjustments because library settings do not work well.
      // Temporary improvements pending library fixes.
      //marginLeft={"$4/5"}
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
