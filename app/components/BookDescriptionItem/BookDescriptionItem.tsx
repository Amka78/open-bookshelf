import React, { useState } from "react"
import { StyleSheet } from "react-native"

import { Box, Image, ImageProps, ListItem, Text, LabeledSpinner } from "@/components"

export type BookDescriptionItemProps = Pick<ImageProps, "source"> & {
  title: string
  authors: string[]
  onPress: () => Promise<void>
  onLongPress: () => void
}

export function BookDescriptionItem(props: BookDescriptionItemProps) {
  const [loading, setLoading] = useState(false)
  let bottomText = ""

  for (const author of props.authors) {
    if (bottomText === "") {
      bottomText = author
    } else {
      bottomText += `,${author}`
    }
  }
  return loading ? (
    <LabeledSpinner
      labelDirection="horizontal"
      label={"bookImage.loading"}
      containerStyle={styles.spinnerSize}
    />
  ) : (
    <ListItem
      LeftComponent={
        <Box flexDirection={"row"} width={"$full"}>
          <Box flexDirection={"row"} width={"$5/6"} marginLeft={2}>
            <Image source={props.source} style={styles.coverImage} resizeMode={"contain"} />
            <Box marginLeft={"$1.5"}>
              <Text fontSize={"$lg"} lineBreakMode="tail" numberOfLines={1}>
                {props.title}
              </Text>
              <Text fontSize={"$md"} marginTop={"$0.5"}>
                {bottomText}
              </Text>
            </Box>
          </Box>
        </Box>
      }
      onPress={async () => {
        setLoading(true)
        await props.onPress()
        setLoading(false)
      }}
      onLongPress={() => {
        if (props.onLongPress) {
          props.onLongPress()
        }
      }}
    />
  )
}

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
  spinnerSize: { height: 56, width: "100%" },
})
