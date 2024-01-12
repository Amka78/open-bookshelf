import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
} from "@gluestack-ui/themed"
import React from "react"

export type PageManagerProps = {
  currentPage: number
  totalPage: number
  onPageChange: (page: number) => void
  reverse: boolean
  visible: boolean
}

export function PageManager(props: PageManagerProps) {
  const pageNum = props.currentPage ? props.currentPage + 1 : 1
  return props.visible ? (
    <VStack
      position={"absolute"}
      left={0}
      right={0}
      bottom={0}
      height={"10%"}
      alignItems={"center"}
      justifyContent={"center"}
      backgroundColor={"white"}
    >
      <Slider
        w="$3/4"
        maxWidth={900}
        defaultValue={props.currentPage}
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
      <Text textAlign="center">
        {pageNum}/{props.totalPage}
      </Text>
    </VStack>
  ) : undefined
}
