import { HStack, IconButton, Text, VStack } from "@/components"
import { usePalette } from "@/theme"
import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, styled } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
import { formatPageIndicator } from "./pageIndicator"

export type PageManagerProps = {
  currentPage: number
  totalPage: number
  onPageChange?: (page: number) => void
  reverse?: boolean
  visible?: boolean
  variant?: "fix" | "free"
  facingPage: boolean
} & ComponentProps<typeof VStack>

function PageManagerCore({
  reverse = false,
  visible = true,
  variant = "fix",
  ...restProps
}: PageManagerProps) {
  const props = { reverse, visible, variant, ...restProps }
  const palette = usePalette()

  const lastPageIndex = Math.max(props.totalPage - 1, 0)
  const pageIndicator = formatPageIndicator(props.currentPage, props.totalPage, props.facingPage)

  const onPageFastMoveButtonPress = (forward: boolean) => {
    if (forward) {
      props.onPageChange(lastPageIndex)
    } else {
      props.onPageChange(0)
    }
  }

  const onPageMoveButtonPress = (forward: boolean) => {
    const forwardStep = props.facingPage ? 2 : 1
    if (forward) {
      props.onPageChange(goToNextPage(props.currentPage, props.totalPage, forwardStep))
    } else {
      props.onPageChange(goToPreviousPage(props.currentPage, forwardStep))
    }
  }

  return props.visible ? (
    <VStack
      {...props}
      height={"10%"}
      alignItems={"center"}
      justifyContent={"center"}
      backgroundColor={props.variant === "fix" ? palette.surfaceStrong : "transparent"}
      style={
        props.variant === "fix"
          ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
          : undefined
      }
    >
      <HStack width={"$full"} justifyContent={"center"}>
        <IconButton
          name="fast-forward"
          rotate="180"
          onPress={() => {
            onPageFastMoveButtonPress(props.reverse ? true : false)
          }}
        />
        <IconButton
          name="forward"
          rotate="180"
          iconSize={"md-"}
          onPress={() => {
            onPageMoveButtonPress(props.reverse ? true : false)
          }}
          marginRight={"$2"}
        />
        <Slider
          w="$3/4"
          maxWidth={900}
          defaultValue={props.currentPage}
          value={props.currentPage}
          minValue={0}
          maxValue={lastPageIndex}
          step={1}
          onChange={(v) => {
            props.onPageChange(v)
          }}
          isReversed={props.reverse}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <IconButton
          name="forward"
          iconSize={"md-"}
          onPress={() => {
            onPageMoveButtonPress(props.reverse ? false : true)
          }}
          marginLeft={"$2"}
        />
        <IconButton
          name="fast-forward"
          onPress={() => {
            onPageFastMoveButtonPress(props.reverse ? false : true)
          }}
        />
      </HStack>
      <Text textAlign="center" marginBottom={"$4"}>
        {pageIndicator}
      </Text>
    </VStack>
  ) : undefined
}

export const PageManager = styled(PageManagerCore, {
  variants: {
    variant: {
      fix: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "$full",
        zIndex: 1,
      } as never,
      free: {
        width: "$full",
      } as never,
    },
  },
  defaultProps: {
    variant: "fix",
  },
} as never)
