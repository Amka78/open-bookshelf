import { styled } from "@gluestack-ui/themed"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export const MaterialCommunityIcon = styled(
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
          px: 0.2,
          py: 0.2,
        },
        tiny: {
          props: {
            size: 14,
          },
        },
        px: 0.1,
        py: 0.1,
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
      variant: "common",
    },
  },
  { ancestorStyle: ["_icon"] },
)
