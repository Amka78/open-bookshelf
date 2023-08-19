import { MessageKey, translate } from "@/i18n"
import { Menu } from "native-base"
import React, { ComponentProps } from "react"

export type MenuItemProps = Omit<ComponentProps<typeof Menu.Item>, "children"> & {
  tx?: MessageKey
  children?: React.ReactNode
}
export function MenuItem(props: MenuItemProps) {
  return <Menu.Item {...props}>{props.tx ? translate(props.tx) : props.children}</Menu.Item>
}
