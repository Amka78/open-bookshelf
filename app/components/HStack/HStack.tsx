import { HStack as Origin } from "native-base"
import React, { ComponentProps } from "react"

export type HStackProps = ComponentProps<typeof Origin>
export function HStack({ alignItems = "center", ...restProps }: HStackProps) {
  const props = { alignItems, ...restProps }
  return <Origin {...props} />
}
