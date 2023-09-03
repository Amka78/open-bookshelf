import { Image } from "expo-image"
import { Box, Flex } from "native-base"
import React, { useState } from "react"
import { StyleSheet } from "react-native"

import { LabeledSpinner } from "../LabeledSpinner/LabeledSpinner"
import { ListItem } from "../ListItem"
import { Text } from "../Text/Text"

export type BookDescriptionItemProps = {
  source: string
  title: string
  authors: string[]
  onPress: () => Promise<void>
}

export function BookDescriptionItem(props: BookDescriptionItemProps) {
  const [loading, setLoading] = useState(false)
  let bottomText = ""

  props.authors.forEach((value) => {
    if (bottomText === "") {
      bottomText = value
    } else {
      bottomText += `,${value}`
    }
  })
  return loading ? (
    <LabeledSpinner
      labelDirection="horizontal"
      label={"bookImage.loading"}
      containerStyle={styles.spinnerSize}
    />
  ) : (
    <ListItem
      LeftComponent={
        <Flex flexDirection={"row"} width={"full"}>
          <Flex flexDirection={"row"} width={"5/6"} marginLeft={2}>
            <Image source={props.source} style={styles.coverImage} resizeMode={"contain"} />
            <Box marginLeft={"1.5"}>
              <Text fontSize={"lg"} lineBreakMode="tail" numberOfLines={1}>
                {props.title}
              </Text>
              <Text fontSize={"md"} marginTop={"0.5"}>
                {bottomText}
              </Text>
            </Box>
          </Flex>
        </Flex>
      }
      onPress={async () => {
        setLoading(true)
        await props.onPress()
        setLoading(false)
      }}
    />
  )
}

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
  spinnerSize: { height: 56, width: "100%" },
})
