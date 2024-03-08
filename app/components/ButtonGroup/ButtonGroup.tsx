import { ButtonGroup as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps } from "react"

export type ButtonGroupProps = ComponentProps<typeof Template>

export function ButtonGroup(props: ButtonGroupProps) {
  return <Template {...props} />
}
