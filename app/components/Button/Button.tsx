import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { ButtonSpinner, ButtonText, Button as Template } from "@gluestack-ui/themed"
import React, { type ComponentProps, useState } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export function Button({ variant = "outline", ...restProps }: ButtonProps) {
  const palette = usePalette()
  const props = { variant, ...restProps }

  const [loading, setLoading] = useState(false)
  return (
    <Template
      {...props}
      borderColor={palette.borderStrong}
      backgroundColor={variant === "solid" ? palette.surfaceStrong : "transparent"}
      onPress={async (e) => {
        if (props.onPress) {
          setLoading(true)
          await props.onPress(e)
          setLoading(false)
        }
      }}
      isDisabled={loading}
    >
      {loading ? <ButtonSpinner color={palette.textSecondary} marginRight={"$1"} /> : undefined}
      <ButtonText color={palette.textPrimary}>
        {restProps.tx ? translate(restProps.tx) : restProps.children}
      </ButtonText>
    </Template>
  )
}
