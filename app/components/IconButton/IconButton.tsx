import { HStack, MaterialCommunityIcon, Text } from "@/components"
import type { MessageKey } from "@/i18n"
import { ButtonSpinner, Pressable } from "@gluestack-ui/themed"
import { type ComponentProps, forwardRef, useState } from "react"

export type IconButtonProps = ComponentProps<typeof Pressable> & {
  iconSize?: "md" | "md-" | "sm" | "sm-"
  variant?: "common" | "staggerRoot" | "staggerChild"
  labelTx?: MessageKey
  pressable?: boolean
  rotate?: "90" | "180" | "270"
} & Pick<ComponentProps<typeof MaterialCommunityIcon>, "name">

export const IconButton = forwardRef(
  (
    { iconSize = "md", variant = "common", pressable = true, ...restProps }: IconButtonProps,
    ref,
  ) => {
    const [loading, setLoading] = useState(false)
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
        onPress={async (event) => {
          if (props.onPress) {
            setLoading(true)
            await props.onPress(event)
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        {loading ? <ButtonSpinner color="$coolGray500" size={35} /> : content}
      </Pressable>
    ) : (
      content
    )
  },
)
