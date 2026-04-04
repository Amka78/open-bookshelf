import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { Pressable, styled } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
export type RatingProps = {
  rating: number | null
  ticks?: number
  onPress?: (rating: number) => void
} & ComponentProps<typeof Box>

const RatingText = styled(
  Text,
  {},
  {
    ancestorStyle: ["_text"],
  },
)

function RatingCore({ ticks = 2, ...restProps }: RatingProps) {
  const props = { ticks, ...restProps }
  let ratingCore: React.ReactNode

  if ((props.rating ?? 0) >= props.ticks) {
    const ratingList = []
    for (let i = 0; i < (props.rating ?? 0); i++) {
      if (i % props.ticks === 0) {
        ratingList.push(i)
      }
    }
    ratingCore = ratingList.map((value) => {
      return <MaterialCommunityIcon key={`rating-${value}`} name="star" />
    })
  } else {
    ratingCore = <RatingText tx="rating.noRate" />
  }

  const rating = <HStack alignSelf="center">{ratingCore}</HStack>
  return (
    <Box {...props}>
      {props.onPress ? (
        <Pressable
          onPress={() => {
            props.onPress?.(props.rating ?? 0)
          }}
        >
          {rating}
        </Pressable>
      ) : (
        rating
      )}
    </Box>
  )
}

export const Rating = styled(
  RatingCore,
  {
    _dark: {
      borderColor: "$white",
    },
    _light: {
      borderColor: "$coolGray800",
    },
    variants: {
      variant: {
        common: {},
        selectable: {
          borderWidth: "$1",
          borderRadius: "$full",
          paddingHorizontal: "$2",
          _light: {
            _icon: {
              color: "$coolGray500",
            },
          },
          _dark: {
            _icon: {
              color: "$white",
            },
            _text: {
              color: "$white",
            },
          },
        },
        selected: {
          borderWidth: "$2",
          borderRadius: "$full",
          backgroundColor: "$blue500",
          paddingHorizontal: "$2",
          _light: {
            _icon: {
              color: "$coolGray500",
            },
          },
          _dark: {
            _icon: {
              color: "$white",
            },
            _text: {
              color: "$white",
            },
          },
        },
      },
      ratingSize: {
        md: {
          _icon: {
            props: {
              iconSize: "sm",
            },
          },
        },
        sm: {
          _icon: {
            props: {
              iconSize: "tiny",
            },
          },
          _text: {
            fontSize: 12,
          },
        },
      },
    },
    defaultProps: {
      variant: "common",
      ratingSize: "md",
    },
  } as never,
  {
    descendantStyle: ["_text", "_icon"],
    ancestorStyle: ["_rating"],
  },
)
