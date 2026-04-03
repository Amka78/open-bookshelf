import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { ButtonSpinner, ButtonText, Button as Template } from "@gluestack-ui/themed"
import { type ComponentProps, useTransition } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export function Button({ variant = "outline", ...restProps }: ButtonProps) {
  const palette = usePalette()
  const props = { variant, ...restProps }

  const [isPending, startTransition] = useTransition()
  return (
    <Template
      {...props}
      borderColor={palette.borderStrong}
      backgroundColor={variant === "solid" ? palette.surfaceStrong : "transparent"}
      onPress={(e) => {
        if (props.onPress) {
          startTransition(async () => {
            await props.onPress!(e)
          })
        }
      }}
      isDisabled={isPending}
    >
      {isPending ? <ButtonSpinner color={palette.textSecondary} marginRight={"$1"} /> : undefined}
      <ButtonText color={palette.textPrimary}>
        {restProps.tx ? translate(restProps.tx) : restProps.children}
      </ButtonText>
    </Template>
  )
}
