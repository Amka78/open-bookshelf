import { translate } from "@/i18n"
import { SortField } from "@/models/CalibreRootStore"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, IconButton, Menu } from "native-base"
import React from "react"

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
          <IconButton
            {...triggerProps}
            mb="4"
            variant="solid"
            bg="yellow.400"
            colorScheme="yellow"
            borderRadius="full"
            icon={
              <Icon
                as={MaterialCommunityIcons}
                _dark={{
                  color: "warmGray.50",
                }}
                size="6"
                name="sort"
                color="warmGray.50"
              />
            }
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
