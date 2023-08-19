import { Slider, Text, VStack } from "native-base"
import React from "react"

export type PageManagerProps = {
  currentPage: number
  totalPage: number
  onPageChange: (page: number) => void
  facing: boolean
  reverse: boolean
}

export function PageManager(props: PageManagerProps) {
  return (
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
        minValue={props.reverse ? props.totalPage * -1 : props.totalPage}
        maxValue={props.reverse ? 0 : props.totalPage}
        step={1}
        onChange={(v) => {
          props.onPageChange(getSliderIndex(v, props.facing))
        }}
        isReversed={props.reverse}
      >
        <Slider.Track>
          <Slider.FilledTrack />
        </Slider.Track>
        <Slider.Thumb />
      </Slider>
      <Text textAlign="center">
        {props.currentPage}/{props.totalPage}
      </Text>
    </VStack>
  )
}

function getSliderIndex(v: number, horizontal: boolean) {
  let pageNum = v * -1

  if (horizontal && pageNum % 2 === 0) {
    pageNum--
  }
  return pageNum
}
