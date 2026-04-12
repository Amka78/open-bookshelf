import { HStack, MaterialCommunityIcon, Text } from "@/components"
import type { MessageKey } from "@/i18n"
import { usePalette } from "@/theme"
import { ButtonSpinner, Pressable } from "@gluestack-ui/themed"
import { type ComponentProps, useTransition } from "react"

export type IconButtonProps = ComponentProps<typeof Pressable> & {
  iconSize?: "md" | "md-" | "sm" | "sm-"
  variant?: "common" | "staggerRoot" | "staggerChild"
  labelTx?: MessageKey
  pressable?: boolean
  rotate?: "90" | "180" | "270"
  loading?: boolean
} & Pick<ComponentProps<typeof MaterialCommunityIcon>, "name">

export const IconButton = ({
  iconSize = "md",
  variant = "common",
  pressable = true,
  loading = false,
  ...restProps
}: IconButtonProps) => {
  const palette = usePalette()
  const [isPending, startTransition] = useTransition()
  const props = restProps
  const icon = (
    <MaterialCommunityIcon
      name={props.name}
      iconSize={iconSize}
      variant={variant}
      rotate={props.rotate}
    />
  )

  const content = props.labelTx ? (
    <HStack>
      {icon}
      <Text tx={props.labelTx} fontSize={"$md"} />
    </HStack>
  ) : (
    icon
  )
  return pressable ? (
    <Pressable
      {...props}
      onPress={(event) => {
        if (props.onPress) {
          if (loading) {
            startTransition(async () => {
              await props.onPress(event)
            })
          } else {
            props.onPress(event)
          }
        }
      }}
      disabled={isPending}
    >
      {isPending ? <ButtonSpinner color={palette.textSecondary} size={35} /> : content}
    </Pressable>
  ) : (
    content
  )
}
