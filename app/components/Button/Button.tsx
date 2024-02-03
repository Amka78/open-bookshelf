import { MessageKey, translate } from "@/i18n"
import { Button as Template, ButtonText, ButtonSpinner } from "@gluestack-ui/themed"
import React, { ComponentProps } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
  isLoading?: boolean
}
export function Button({ isLoading = false, variant = "outline", ...restProps }: ButtonProps) {
  const props = { isLoading, variant, ...restProps }
  return (
    <Template {...props} borderColor="$textDark700">
      {props.isLoading ?? <ButtonSpinner />}
      <ButtonText color={variant === "outline" ? "$textDark700" : undefined}>
        {restProps.tx ? translate(restProps.tx) : restProps.children}
      </ButtonText>
    </Template>
  )
}
