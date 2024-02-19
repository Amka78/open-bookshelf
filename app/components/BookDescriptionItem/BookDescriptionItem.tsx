import { useState } from "react"
import { StyleSheet } from "react-native"

import {
  Box,
  Image,
  ImageProps,
  ListItem,
  Text,
  LabeledSpinner,
  LinkButton,
  LinkInfo,
} from "@/components"

export type BookDescriptionItemProps = Pick<ImageProps, "source"> & {
  title: string
  authors: string[]
  conjunction: string
  onPress: () => Promise<void>
  onLongPress: () => void
  onLinkPress: (link: string) => void
  loading?: boolean
}

export function BookDescriptionItem({ loading = false, ...restProps }: BookDescriptionItemProps) {
  const props = { loading, ...restProps }
  const [loadingState, setLoadingState] = useState(props.loading)

  const linkInfoList: LinkInfo[] = []
  for (const author of props.authors) {
    linkInfoList.push({ value: author })
  }
  return loadingState ? (
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
              <LinkButton conjunction={"&"} onPress={props.onLinkPress}>
                {linkInfoList}
              </LinkButton>
            </Box>
          </Box>
        </Box>
      }
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
    />
  )
}

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
  spinnerSize: { height: 56, width: "100%" },
})
