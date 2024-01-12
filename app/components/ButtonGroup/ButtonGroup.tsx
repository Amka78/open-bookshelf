import React, { ComponentProps } from "react"
import { ButtonGroup as Template } from "@gluestack-ui/themed"

export type ButtonGroupProps = ComponentProps<typeof Template>

export function ButtonGroup(props: ButtonGroupProps) {
  return <Template {...props} />
}
