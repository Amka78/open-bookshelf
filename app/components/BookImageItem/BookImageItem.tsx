import { Image } from "expo-image"
import { Box } from "native-base"
import React, { useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"

import { LabeledSpinner } from ".."

export type BookImageprops = {
  source: string
  onPress: () => Promise<void>
}
export function BookImageItem(props: BookImageprops) {
  const [loading, setLoading] = useState(false)

  console.log(props.source)
  return (
    <TouchableOpacity
      onPress={async () => {
        setLoading(true)
        await props.onPress()
        setLoading(false)
      }}
    >
      <Box marginX={"2"} marginTop={"2"}>
        {loading ? (
          <LabeledSpinner
            containerStyle={styles.imageSize}
            label={"bookImage.loading"}
            labelDirection="vertical"
          />
        ) : (
          <Image source={props.source} style={styles.imageSize} resizeMode={"contain"} />
        )}
      </Box>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  imageSize: {
    height: 320,
    width: 240,
  },
})
