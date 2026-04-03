import { HStack, Rating } from "@/components"
import { styled } from "@gluestack-style/react"
import { type ComponentProps, type Ref } from "react"

export type RatingGroupProps = {
  max: number
  ticks?: number
  onSelectRating(rating: number)
  selectedValue: number
  ref?: Ref<React.ElementRef<typeof HStack>>
} & ComponentProps<typeof HStack>

const RatingGroupCore = ({ ticks = 2, ref, ...restProps }: RatingGroupProps) => {
  const props = { ticks, ...restProps }
    const ratingList: Array<number | null> = []

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
      <HStack {...props} ref={ref as never}>
        {ratingList.map((value) => {
          return (
            <Rating
              key={`rating-option-${value ?? 0}`}
              rating={value}
              onPress={onSelectRating}
              {...({ variant: value === props.selectedValue ? "selected" : "selectable" } as never)}
            />
          )
        })}
      </HStack>
    )
}

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
  } as never,
  {
    descendantStyle: ["_rating"],
  },
)
