import { Input as Template } from "@gluestack-ui/themed"
import React, { ComponentProps, forwardRef } from "react"

export type InputProps = ComponentProps<typeof Template>

export function Input({ variant = "underlined", size = "lg", ...restProps }: InputProps) {
  const props = { variant, size, ...restProps }

  return <Template {...props} />
}
