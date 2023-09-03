import { Slider, Text, VStack } from "native-base"
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
        w="3/4"
        maxW="900"
        $PWD={props.reverse}
        defaultValue={props.reverse ? props.currentPage * -1 : props.currentPage}
        minValue={props.reverse ? props.totalPage * -1 : 0}
        maxValue={props.reverse ? 0 : props.totalPage}
        step={1}
        onChange={(v) => {
          const index = v < 0 ? v * -1 : v
          props.onPageChange(index)
        }}
        isReversed={props.reverse}
      >
        <Slider.Track>
          <Slider.FilledTrack />
        </Slider.Track>
        <Slider.Thumb />
      </Slider>
      <Text textAlign="center">
        {pageNum}/{props.totalPage}
      </Text>
    </VStack>
  ) : undefined
}
