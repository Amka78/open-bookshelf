import { HStack, IconButton, Text, VStack, type SeriesNavigationInfo } from "@/components"
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
  facingSecondPageExists?: boolean
  seriesInfo?: SeriesNavigationInfo | null
  onPreviousSeriesBook?: () => void
  onNextSeriesBook?: () => void
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
  const pageIndicator = formatPageIndicator(
    props.currentPage,
    props.totalPage,
    props.facingPage,
    props.facingSecondPageExists,
  )

  const onPageFastMoveButtonPress = (forward: boolean) => {
    if (forward) {
      props.onPageChange!(lastPageIndex)
    } else {
      props.onPageChange!(0)
    }
  }

  const onPageMoveButtonPress = (forward: boolean) => {
    const forwardStep = props.facingPage ? 2 : 1
    if (forward) {
      props.onPageChange!(goToNextPage(props.currentPage, props.totalPage, forwardStep))
    } else {
      props.onPageChange!(goToPreviousPage(props.currentPage, forwardStep))
    }
  }

  const hasSeries = !!props.seriesInfo
  const footerHeight = hasSeries ? "15%" : "10%"

  return props.visible ? (
    <VStack
      {...props}
      height={footerHeight}
      alignItems={"center"}
      justifyContent={"center"}
      backgroundColor={props.variant === "fix" ? palette.surfaceOverlay : "transparent"}
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
          testID="page-manager-first"
          onPress={() => {
            onPageFastMoveButtonPress(props.reverse ? true : false)
          }}
        />
        <IconButton
          name="forward"
          rotate="180"
          iconSize={"md-"}
          testID="page-manager-backward"
          onPress={() => {
            onPageMoveButtonPress(props.reverse ? true : false)
          }}
          style={{ marginRight: 8 }}
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
            props.onPageChange!(v)
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
          testID="page-manager-forward"
          onPress={() => {
            onPageMoveButtonPress(props.reverse ? false : true)
          }}
          style={{ marginLeft: 8 }}
        />
        <IconButton
          name="fast-forward"
          testID="page-manager-last"
          onPress={() => {
            onPageFastMoveButtonPress(props.reverse ? false : true)
          }}
        />
      </HStack>
      <Text textAlign="center" marginBottom={"$4"} testID="page-indicator">
        {pageIndicator}
      </Text>
      {props.seriesInfo ? (
        <HStack alignItems="center" marginBottom={"$2"}>
          <IconButton
            name="chevron-left"
            iconSize="sm"
            onPress={props.onPreviousSeriesBook}
            disabled={!props.seriesInfo.hasPrevious}
            style={{ opacity: props.seriesInfo.hasPrevious ? 1 : 0.4 }}
          />
          <Text fontSize={"$sm"} color={palette.textSecondary} isTruncated={true}>
            {props.seriesInfo.seriesName} ({props.seriesInfo.currentIndex + 1}/
            {props.seriesInfo.totalCount})
          </Text>
          <IconButton
            name="chevron-right"
            iconSize="sm"
            onPress={props.onNextSeriesBook}
            disabled={!props.seriesInfo.hasNext}
            style={{ opacity: props.seriesInfo.hasNext ? 1 : 0.4 }}
          />
        </HStack>
      ) : null}
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
