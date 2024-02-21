import { styled, Pressable, ButtonSpinner } from "@gluestack-ui/themed"
import { ComponentProps, forwardRef, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { MessageKey } from "@/i18n"
import { Text, HStack } from "@/components"
import { delay } from "@/utils/delay"

export const MaterialCommunityIcon = styled(MaterialCommunityIcons, {
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
}, { ancestorStyle: ["_icon"] })
