import React, { ComponentProps } from "react"
import { Button } from "native-base"

export type ButtonGroupProps = ComponentProps<typeof Button.Group>

export function ButtonGroup(props: ButtonGroupProps) {
  return <Button.Group {...props} />
}
