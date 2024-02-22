import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { Pressable, styled } from "@gluestack-ui/themed"
export type RatingProps = {
  rating: number
  ticks?: number
  onPress?: (rating: number) => void
}

const RatingText = styled(Text, {

}, {
  ancestorStyle: ["_text"]
})

function RatingCore({ ticks = 2, ...restProps }: RatingProps) {
  const props = { ticks, ...restProps }
  let ratingCore: React.ReactNode

  if (props.rating >= props.ticks) {
    const ratingList = []
    for (let i = 0; i < props.rating; i++) {
      if (i % props.ticks === 0) {
        ratingList.push(i)
      }
    }
    ratingCore = ratingList.map(() => {
      return <MaterialCommunityIcon name="star" />
    })
  } else {
    ratingCore = <RatingText tx="rating.noRate" />
  }

  const rating = <HStack alignSelf="center">{ratingCore}</HStack>
  return <Box {...props}>
    {props.onPress ? (
      <Pressable
        onPress={() => {
          props.onPress(props.rating)
        }}
      >
        {rating}
      </Pressable>
    ) : (
      rating
    )}</Box>
}

export const Rating = styled(RatingCore, {
  _dark: {
    // @ts-ignore
    borderColor: "$white",
  },
  _light: {
    // @ts-ignore
    borderColor: "$coolGray800",
  },
  "variants": {
    variant: {
      common: {

      },
      "selectable": {
        borderWidth: "$1",
        borderRadius: "$full",
        paddingHorizontal: "$2",
        _dark: {
          _icon: {
            color: "$white"
          },
          _text: {
            color: "$white"
          },
        }
      }
    },
    "ratingSize": {
      "md": {
        "_icon": {
          props: {
            "iconSize": "sm"
          }
        }
      },
      "sm": {
        "_icon": {
          props: {
            "iconSize": "sm-"
          }
        }
      }
    },
  },
  defaultProps: {
    variant: "common",
    ratingSize: "md"
  }
}, {
  descendantStyle: ["_text", "_icon"],
  ancestorStyle: ["_rating"]
})