import { styled, Pressable } from "@gluestack-ui/themed"
import { ComponentProps, forwardRef } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { MessageKey } from "@/i18n"
import { Text, HStack } from "@/components"

export type IconButtonProps = ComponentProps<typeof Pressable> & {
  iconSize?: "md" | "md-"
  variant?: "common" | "staggerRoot" | "staggerChild"
  labelTx?: MessageKey
  pressable?: boolean
} & Pick<ComponentProps<typeof MaterialCommunityIcons>, "name">

const StyledIcon = styled(MaterialCommunityIcons, {
  variants: {
    iconSize: {
      md: {
        props: {
          size: 40,
        },
        px: "$1",
        py: "$1",
      },
      "md-": {
        props: {
          size: 37,
        },
        px: "$0.5",
        py: "$0.5",
      },
    },
    variant: {
      common: {
        borderRadius: "$none",
        color: "$coolGray800",
      },
      staggerRoot: {
        borderRadius: "$full",
        color: "white",
        bgColor: "$coolGray800",
      },
      staggerChild: {
        borderRadius: "$full",
        color: "$coolGray800",
        bgColor: "white",
        borderColor: "$coolGray800",
      },
    },
  },
})

export const IconButton = forwardRef(
  (
    { iconSize = "md", variant = "common", pressable = true, ...restProps }: IconButtonProps,
    ref,
  ) => {
    const props = restProps
    const icon = <StyledIcon name={props.name} iconSize={iconSize} variant={variant} />

    const content = props.labelTx ? (
      <HStack>
        {icon}
        <Text tx={props.labelTx} fontSize={"$md"} />
      </HStack>
    ) : (
      icon
    )
    return pressable ? <Pressable {...props}>{content}</Pressable>: content
  },
)
