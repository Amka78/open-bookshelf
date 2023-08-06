import React, { ComponentProps } from "react"
import { Menu } from "native-base"
import { MessageKey, translate } from "../../i18n"

export type MenuItemProps = ComponentProps<typeof Menu.Item> & {
  tx?: MessageKey
}
export function MenuItem(props: MenuItemProps) {
  return <Menu.Item {...props}>{props.tx ? translate(props.tx) : props.children}</Menu.Item>
}
