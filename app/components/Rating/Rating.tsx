import type { ComponentProps } from "react"
import { Pressable, useColorScheme } from "react-native"
import { Box } from "../Box/Box"
import { HStack } from "../HStack/HStack"
import { MaterialCommunityIcon } from "../MaterialCommunityIcon/MaterialCommunityIcon"
import { Text } from "../Text/Text"

export type RatingProps = {
  rating: number | null
  ticks?: number
  onPress?: (rating: number) => void
  variant?: "common" | "selectable" | "selected"
  ratingSize?: "md" | "sm"
} & ComponentProps<typeof Box>

// 旧 styled 定義のトークン実値 (gluestack config より)。
// light: $coolGray800 / $coolGray500、dark: $white、selected の背景は $blue500。
const LIGHT_BORDER_COLOR = "#1f2937"
const LIGHT_ICON_COLOR = "#6b7280"
const DARK_COLOR = "#ffffff"
const SELECTED_BACKGROUND_COLOR = "#3b82f6"
const RATING_BORDER_RADIUS = 9999
const RATING_PADDING_HORIZONTAL = 8

export const Rating = ({
  ticks = 2,
  variant = "common",
  ratingSize = "md",
  ...restProps
}: RatingProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const isBoxed = variant === "selectable" || variant === "selected"
  const iconColor = isBoxed ? (isDark ? DARK_COLOR : LIGHT_ICON_COLOR) : undefined
  // sm と md は旧 styled の ratingSize が iconSize を差し替えていた (md: "sm", sm: "tiny")。
  const iconSize = ratingSize === "sm" ? "tiny" : "sm"
  const boxedStyle = isBoxed
    ? {
        borderWidth: variant === "selected" ? 2 : 1,
        borderRadius: RATING_BORDER_RADIUS,
        paddingHorizontal: RATING_PADDING_HORIZONTAL,
        borderColor: isDark ? DARK_COLOR : LIGHT_BORDER_COLOR,
        backgroundColor: variant === "selected" ? SELECTED_BACKGROUND_COLOR : undefined,
      }
    : undefined

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
      return (
        <MaterialCommunityIcon
          key={`rating-${value}`}
          name="star"
          testID="rating-star"
          color={iconColor}
          iconSize={iconSize}
        />
      )
    })
  } else {
    ratingCore = (
      <Text tx="rating.noRate" color={iconColor} fontSize={ratingSize === "sm" ? 12 : undefined} />
    )
  }

  const rating = <HStack alignSelf="center">{ratingCore}</HStack>
  return (
    <Box {...props} style={[boxedStyle, props.style]}>
      {props.onPress ? (
        <Pressable
          accessibilityRole="button"
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
