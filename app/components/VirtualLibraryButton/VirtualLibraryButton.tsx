import { MaterialCommunityIcon } from "@/components/MaterialCommunityIcon/MaterialCommunityIcon"
import { translate } from "@/i18n"
import type { VirtualLibrary } from "@/models/calibre/VirtualLibraryModel"
import { Menu, MenuItem, MenuItemLabel, Pressable } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"

export type VirtualLibraryButtonProps = {
  virtualLibraries: VirtualLibrary[]
  selectedVl?: string | null
  onSelect: (vl: string | null) => void
  isLargeScreen?: boolean
} & Omit<ComponentProps<typeof Menu>, "trigger" | "children">

export function VirtualLibraryButton({
  virtualLibraries,
  selectedVl,
  onSelect,
  isLargeScreen,
  ...menuProps
}: VirtualLibraryButtonProps) {
  if (!virtualLibraries?.length) return null

  return (
    <Menu
      placement={isLargeScreen ? "bottom" : "left bottom"}
      closeOnSelect={true}
      {...menuProps}
      trigger={(triggerProps) => (
        <Pressable
          {...triggerProps}
          accessibilityLabel={translate("virtualLibrary.buttonTooltip")}
          testID="virtual-library-button"
        >
          <MaterialCommunityIcon
            name={selectedVl ? "library" : "library-outline"}
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
          key={vl.name}
          textValue={vl.name}
          testID={`vl-item-${vl.name}`}
          onPress={() => onSelect(vl.name)}
        >
          <MenuItemLabel>{vl.name}</MenuItemLabel>
        </MenuItem>
      ))}
    </Menu>
  )
}
