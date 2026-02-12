import { usePalette } from "@/theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { styled } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"

const StyledIcon = styled(
  MaterialCommunityIcons,
  {
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
        sm: {
          props: {
            size: 24,
          },
          px: 0.2,
          py: 0.2,
        },
        "sm-": {
          props: {
            size: 21,
          },
        },
        tiny: {
          props: {
            size: 14,
          },
        },
      },
      rotate: {
        "0": {},
        "90": {
          transform: [{ rotate: "90deg" }],
        },
        "180": {
          transform: [{ rotate: "180deg" }],
        },
        "270": {
          transform: [{ rotate: "270deg" }],
        },
      },
    },
    defaultProps: {
      iconSize: "md",
    },
  },
  { ancestorStyle: ["_icon"] },
)

export type MaterialCommunityIconProps = ComponentProps<typeof StyledIcon> & {
  variant?: "common" | "staggerRoot" | "staggerChild"
}

export function MaterialCommunityIcon({
  variant = "common",
  ...props
}: MaterialCommunityIconProps) {
  const palette = usePalette()

  const variantColors: Record<
    NonNullable<MaterialCommunityIconProps["variant"]>,
    { color: string; bgColor?: string; borderColor?: string }
  > = {
    common: {
      color: palette.textSecondary,
    },
    staggerRoot: {
      color: palette.textPrimary,
      bgColor: palette.surfaceStrong,
    },
    staggerChild: {
      color: palette.textPrimary,
      bgColor: palette.surfaceMuted,
      borderColor: palette.borderStrong,
    },
  } as const

  const resolved = variantColors[variant]

  return (
    <StyledIcon
      {...props}
      color={props.color ?? resolved.color}
      bgColor={props.bgColor ?? resolved.bgColor}
      borderColor={props.borderColor ?? resolved.borderColor}
    />
  )
}
