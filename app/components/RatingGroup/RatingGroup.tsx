import { HStack, Rating } from "@/components"
import { styled } from "@gluestack-style/react"
import { forwardRef } from "react"

export type RatingGroupProps = {
  max: number
  ticks?: number
  onSelectRating(rating: number)
  selectedValue: number
}

const RatingGroupCore = forwardRef(({ ticks = 2, ...restProps }: RatingGroupProps, ref) => {
  const props = { ticks, ...restProps }
  const ratingList = []

  const onSelectRating = (rating: number) => {
    if (props.onSelectRating) {
      props.onSelectRating(rating)
    }
  }
  for (let i = 0; i <= props.max; i++) {
    if (i % props.ticks === 0) {
      if (i === 0) {
        ratingList.push(null)
      } else {
        ratingList.push(i)
      }
    }
  }
  return (
    <HStack {...props} ref={ref}>
      {ratingList.map((value) => {
        return (
          <Rating
            rating={value}
            onPress={onSelectRating}
            variant={value === props.selectedValue ? "selected" : "selectable"}
          />
        )
      })}
    </HStack>
  )
})

export const RatingGroup = styled(
  RatingGroupCore,
  {
    flexWrap: "wrap",
    variants: {
      variant: {
        common: {
          props: {
            space: "sm",
          },
          _rating: {
            props: {
              variant: "common",
              ratingSize: "sm",
            },
          },
        },
      },
    },
    defaultProps: {
      variant: "common",
    },
  },
  {
    descendantStyle: ["_rating"],
  },
)
