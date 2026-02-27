import { MaterialCommunityIcon } from "@/components/MaterialCommunityIcon/MaterialCommunityIcon"
import { translate } from "@/i18n"
import { Menu, MenuItem, MenuItemLabel, Pressable } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"

export type VirtualLibraryButtonProps = {
  virtualLibraries: string[]
  selectedVl?: string | null
  onSelect: (vl: string | null) => void
} & Omit<ComponentProps<typeof Menu>, "trigger" | "children">

export function VirtualLibraryButton({
  virtualLibraries,
  selectedVl,
  onSelect,
  ...menuProps
}: VirtualLibraryButtonProps) {
  if (!virtualLibraries?.length) return null

  return (
    <Menu
      placement="left bottom"
      closeOnSelect={true}
      {...menuProps}
      trigger={(triggerProps) => (
        <Pressable
          {...triggerProps}
          accessibilityLabel={translate("virtualLibrary.buttonTooltip")}
          testID="virtual-library-button"
        >
          <MaterialCommunityIcon
            name={selectedVl ? "book-filter" : "book-filter-outline"}
            iconSize="md-"
            variant="staggerChild"
          />
        </Pressable>
      )}
    >
      <MenuItem
        key="__all__"
        textValue="__all__"
        testID="vl-item-all"
        onPress={() => onSelect(null)}
      >
        <MenuItemLabel>{translate("virtualLibrary.all")}</MenuItemLabel>
      </MenuItem>
      {virtualLibraries.map((vl) => (
        <MenuItem
          key={vl}
          textValue={vl}
          testID={`vl-item-${vl}`}
          onPress={() => onSelect(vl)}
        >
          <MenuItemLabel>{vl}</MenuItemLabel>
        </MenuItem>
      ))}
    </Menu>
  )
}
