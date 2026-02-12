import { HStack, IconButton, Text, VStack } from "@/components"
import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { usePalette } from "@/theme"
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, styled } from "@gluestack-ui/themed"

export type PageManagerProps = {
  currentPage: number
  totalPage: number
  onPageChange?: (page: number) => void
  reverse?: boolean
  visible?: boolean
  variant: "fix" | "free"
  facingPage: boolean
}

function PageManagerCore({ reverse = false, visible = true, ...restProps }: PageManagerProps) {
  const props = { reverse, visible, ...restProps }
  const palette = usePalette()

  const pageNum = props.currentPage ? props.currentPage + 1 : 1

  const onPageFastMoveButtonPress = (forward: boolean) => {
    if (forward) {
      props.onPageChange(props.totalPage)
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
          maxValue={props.totalPage}
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
        {pageNum}/{props.totalPage + 1}
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
      },
      free: {
        width: "$full",
      },
    },
  },
  defaultProps: {
    variant: "fix",
  },
})
