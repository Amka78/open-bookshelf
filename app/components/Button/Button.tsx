import { MessageKey, translate } from "@/i18n"
import { Button as Template, ButtonText, ButtonSpinner } from "@gluestack-ui/themed"
import React, { ComponentProps } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
  isLoading: boolean
}
export function Button({ isLoading = false, ...restProps }: ButtonProps) {
  const props = { isLoading, ...restProps }
  return (
    <Template {...props} variant="outline" borderColor="$textDark700">
      {props.isLoading ?? <ButtonSpinner />}
      <ButtonText color="$textDark700">
        {restProps.tx ? translate(restProps.tx) : restProps.children}
      </ButtonText>
    </Template>
  )
}
