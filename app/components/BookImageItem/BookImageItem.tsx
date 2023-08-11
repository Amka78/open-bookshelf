import ExpoFastImage from "expo-fast-image"
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
          <ExpoFastImage source={props.source} style={styles.imageSize} resizeMode={"stretch"} />
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
