import { MessageKey, translate } from "@/i18n"
import { Button as Template, ButtonText, ButtonSpinner } from "@gluestack-ui/themed"
import React, { ComponentProps, useState } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export function Button({ variant = "outline", ...restProps }: ButtonProps) {
  const props = { variant, ...restProps }

  const [loading, setLoading] = useState(false)
  return (
    <Template
      {...props}
      borderColor="$textDark700"
      onPress={async (e) => {
        if (props.onPress) {
          setLoading(true)
          await props.onPress(e)
          setLoading(false)
        }
      }}
      isDisabled={loading}
    >
      {loading ? <ButtonSpinner color={"$coolGray500"} marginRight={"$1"} /> : undefined}
      <ButtonText color={variant === "outline" ? "$textDark700" : undefined}>
        {restProps.tx ? translate(restProps.tx) : restProps.children}
      </ButtonText>
    </Template>
  )
}
