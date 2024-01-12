import { styled, Pressable } from "@gluestack-ui/themed"
import { ComponentProps, forwardRef } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export type IconButtonProps = ComponentProps<typeof Pressable> & {
  iconSize?: "md" | "md-"
  variant?: "common" | "staggerRoot" | "staggerChild"
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
  ({ iconSize = "md", variant = "common", ...restProps }: IconButtonProps, ref) => {
    const props = restProps
    return (
      <Pressable {...props}>
        <StyledIcon name={props.name} iconSize={iconSize} variant={variant} />
      </Pressable>
    )
  },
)
