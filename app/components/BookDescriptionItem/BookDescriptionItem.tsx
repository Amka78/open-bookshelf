import { Pressable } from "@gluestack-ui/themed"
import { useState } from "react"
import { StyleSheet } from "react-native"

import {
  Box,
  Image,
  type ImageProps,
  LabeledSpinner,
  LinkButton,
  type LinkInfo,
  ListItem,
  MaterialCommunityIcon,
  Text,
} from "@/components"

export type BookDescriptionItemProps = Pick<ImageProps, "source"> & {
  title: string
  authors: string[]
  conjunction?: string
  onPress: () => Promise<void>
  onLongPress: () => void
  onLinkPress: (link: string) => void
  loading?: boolean
  showCachedIcon?: boolean
  onCachedIconPress?: () => void
}

export function BookDescriptionItem({ loading = false, ...restProps }: BookDescriptionItemProps) {
  const props = { loading, ...restProps }
  const [loadingState, setLoadingState] = useState(props.loading)

  const linkInfoList: LinkInfo[] = []
  for (const author of props.authors) {
    linkInfoList.push({ value: author })
  }
  return (
    <Box height={50} width={"$full"} justifyContent="center">
      {loadingState ? (
        <LabeledSpinner
          labelDirection="horizontal"
          labelTx={"bookImage.loading"}
          containerStyle={styles.spinnerSize}
        />
      ) : (
        <ListItem
          LeftComponent={
            <Box flexDirection={"row"} width={"$full"}>
              <Box flexDirection={"row"} width={"$5/6"} marginLeft={2}>
                <Box style={styles.coverImageContainer}>
                  <Image source={props.source} style={styles.coverImage} resizeMode={"contain"} />
                  {props.showCachedIcon ? (
                    <Pressable
                      onPress={() => {
                        props.onCachedIconPress?.()
                      }}
                      style={styles.cachedIconBadge}
                    >
                      <MaterialCommunityIcon name="cloud-check" iconSize="tiny" />
                    </Pressable>
                  ) : null}
                </Box>
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
      )}
    </Box>
  )
}

const styles = StyleSheet.create({
  coverImage: { height: 50, width: 30 },
  coverImageContainer: {
    height: 50,
    width: 30,
    position: "relative",
  },
  cachedIconBadge: {
    position: "absolute",
    top: -2,
    left: -2,
  },
  spinnerSize: { height: 56, width: "100%" },
})
