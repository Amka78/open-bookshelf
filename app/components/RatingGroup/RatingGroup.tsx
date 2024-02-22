import { HStack, Rating } from "@/components"
import { styled } from "@gluestack-style/react"

export type RatingGroup = {
  max: number,
  ticks?: number
  onSelectRating(rating: number)
}

function RatingGroupCore({ ticks = 2, ...restProps }: RatingGroup) {

  const props = { ticks, ...restProps }
  const ratingList = []

  const onSelectRating = (rating: number) => {
    if (props.onSelectRating) {
      props.onSelectRating(rating)
    }
  }
  for (let i = 0; i <= props.max; i++) {
    if (i % props.ticks === 0) {
      ratingList.push(i)
    }
  }
  return <HStack {...props}>
    {
      ratingList.map((value) => {
        return <Rating rating={value} onPress={onSelectRating} />
      })
    }
  </HStack>
}

export const RatingGroup = styled(RatingGroupCore, {
  "variants": {
    "variant": {
      "common": {
        props: {
          space: "sm"
        },
        "_rating": {
          props: {
            "variant": "selectable",
            "ratingSize": "sm"
          }
        }
      }
    },
  },
  defaultProps: {
    "variant": "common"
  }
}, {
  descendantStyle: ["_rating"],
}
)