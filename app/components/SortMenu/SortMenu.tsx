import { translate } from "@/i18n"
import { SortField } from "@/models/CalibreRootStore"
import { Menu } from "native-base"
import React from "react"
import { StaggerButton } from "@/components"

export type SortMenuProps = {
  selectedSort: string
  selectedSortOrder: string
  field: SortField[]
  onSortChange: (sortId: string) => void
}
export function SortMenu(props: SortMenuProps) {
  return (
    <Menu
      w="190"
      placement="left"
      trigger={(triggerProps) => {
        return (
          <StaggerButton
            {...triggerProps}
            mb="4"
            bg="coolGray.700"
            _dark={{
              color: "black",
            }}
            name="sort"
            color="white"
          />
        )
      }}
    >
      <Menu.OptionGroup
        defaultValue={props.selectedSort}
        type="radio"
        title={translate("sortMenu.sort")}
        onChange={props.onSortChange}
      >
        {props.field.map((value) => {
          return (
            <>
              <Menu.ItemOption value={value.id} key={value.id}>
                {value.id === props.selectedSort
                  ? `${value.name}-${translate(
                      props.selectedSortOrder === "asc" ? "sortMenu.asc" : "sortMenu.desc",
                    )}`
                  : value.name}
              </Menu.ItemOption>
            </>
          )
        })}
      </Menu.OptionGroup>
    </Menu>
  )
}
