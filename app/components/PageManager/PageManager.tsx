import { HStack, IconButton, Text, VStack } from "@/components"
import { goToNextPage, goToPreviousPage } from "@/utils/pageTurnning"
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, styled } from "@gluestack-ui/themed"

export type PageManagerProps = {
  currentPage: number
  totalPage: number
  onPageChange?: (page: number) => void
  reverse?: boolean
  visible?: boolean
  variant: "fix" | "free"
}

function PageManagerCore({ reverse = false, visible = true, ...restProps }: PageManagerProps) {
  const props = { reverse, visible, ...restProps }

  const pageNum = props.currentPage ? props.currentPage + 1 : 1

  const onPageFastMoveButtonPress = (forward: boolean) => {
    if (forward) {
      props.onPageChange(props.totalPage)
    } else {
      props.onPageChange(0)
    }
  }

  const onPageMoveButtonPress = (forward: boolean) => {
    if (forward) {
      props.onPageChange(goToNextPage(props.currentPage, props.totalPage, 1))
    } else {
      props.onPageChange(goToPreviousPage(props.currentPage, 1))
    }
  }

  return props.visible ? (
    <VStack {...props} height={"10%"} alignItems={"center"} justifyContent={"center"}>
      <HStack width={"$full"}>
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
      <Text textAlign="center">
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
