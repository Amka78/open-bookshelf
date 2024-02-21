import { Box, HStack, MaterialCommunityIcon, Text } from "@/components"
import { Pressable, styled } from "@gluestack-ui/themed"
export type RatingProps = {
  rating: number
  onPress?: (rating: number) => void
}

const RatingText = styled(Text, {

}, {
  ancestorStyle: ["_text"]
})

function RatingCore(props: RatingProps) {
  let ratingCore: React.ReactNode

  if (props.rating > 1) {
    const ratingList = []
    for (let i = 0; i < props.rating; i++) {
      if (i % 2 === 0) {
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
    _icon: {
      color: "$white"
    }
  },
  variants: {
    variant: {
      common: {

      },
      selectable: {
        borderWidth: "$1",
        borderRadius: "$full",
        paddingHorizontal: "$2",
        _light: {
          borderColor: "$coolGray800",

        },
        _dark: {
          borderColor: "$white",
          _text: {
            color: "$white"
          },
        },
      },
    },
    defaultProps: {
      variant: "common"
    }
  }
}, {
  descendantStyle: ["_text", "_icon"],
})