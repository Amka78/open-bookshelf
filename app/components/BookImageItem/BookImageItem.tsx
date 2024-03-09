import React, { useState } from "react"
import { StyleSheet } from "react-native"

import { Box, Image, type ImageProps, LabeledSpinner } from "@/components"
import { Pressable } from "@gluestack-ui/themed"

export type BookImageprops = Pick<ImageProps, "source"> & {
  onPress?: () => Promise<void>
  onLongPress?: () => void
  loading?: boolean
}
export function BookImageItem({ loading = false, ...restProps }: BookImageprops) {
  const props = { loading, ...restProps }
  const [loadingState, setLoadingState] = useState(props.loading)

  const image = <Image source={props.source} style={styles.imageSize} resizeMode={"contain"} />
  const content =
    props.onPress || props.onLongPress ? (
      <Pressable
        onPress={async () => {
          setLoadingState(true)
          await props.onPress()
          setLoadingState(false)
        }}
        onLongPress={() => {
          if (props.onLongPress) {
            props.onLongPress()
          }
        }}
      >
        {image}
      </Pressable>
    ) : (
      image
    )

  return (
    <Box marginHorizontal={"$2"} marginTop={"$2"}>
      {loading || loadingState ? (
        <LabeledSpinner
          containerStyle={styles.imageSize}
          labelTx={"bookImage.loading"}
          labelDirection="vertical"
        />
      ) : (
        content
      )}
    </Box>
  )
}

const styles = StyleSheet.create({
  imageSize: {
    height: 320,
    width: 240,
  },
})
