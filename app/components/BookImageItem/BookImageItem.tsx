import React, { useEffect, useRef, useState } from "react"
import { StyleSheet } from "react-native"

import {
  BookDetailMenu,
  Box,
  Image,
  type ImageProps,
  LabeledSpinner,
  MaterialCommunityIcon,
} from "@/components"
import type { BookDetailMenuProps } from "@/components"
import { Pressable } from "@gluestack-ui/themed"

export type BookImageprops = Pick<ImageProps, "source"> & {
  onPress?: () => Promise<void>
  onLongPress?: () => void
  onCachedIconPress?: () => void
  loading?: boolean
  detailMenuProps?: BookDetailMenuProps
  showCachedIcon?: boolean
}
export function BookImageItem({ loading = false, ...restProps }: BookImageprops) {
  const props = { loading, ...restProps }
  const [loadingState, setLoadingState] = useState(props.loading)
  const [isHovered, setIsHovered] = useState(false)
  const hoverOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showDetailMenu = Boolean(props.detailMenuProps && isHovered)

  const handleHoverIn = () => {
    if (hoverOutTimerRef.current) {
      clearTimeout(hoverOutTimerRef.current)
      hoverOutTimerRef.current = null
    }
    setIsHovered(true)
  }

  const handleHoverOut = () => {
    if (hoverOutTimerRef.current) {
      clearTimeout(hoverOutTimerRef.current)
    }
    hoverOutTimerRef.current = setTimeout(() => {
      setIsHovered(false)
      hoverOutTimerRef.current = null
    }, 80)
  }

  useEffect(() => {
    return () => {
      if (hoverOutTimerRef.current) {
        clearTimeout(hoverOutTimerRef.current)
      }
    }
  }, [])

  const image = <Image source={props.source} style={styles.imageSize} contentFit={"fill"} />
  const contentWithMenu = (
    <Box style={styles.imageContainer} onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>
      {image}
      {props.showCachedIcon ? (
        <Pressable
          onPress={(event) => {
            props.showCachedIcon && props.onCachedIconPress?.()
          }}
          style={styles.cachedIconBadge}
        >
          <MaterialCommunityIcon name="cloud-check" iconSize="sm-" />
        </Pressable>
      ) : null}
      {showDetailMenu ? (
        <Box style={styles.detailMenuOverlay}>
          <BookDetailMenu
            {...props.detailMenuProps}
            iconOpacity={0.85}
            containerProps={{ alignItems: "center", justifyContent: "center" }}
            iconButtonProps={{ style: styles.detailMenuIcon }}
          />
        </Box>
      ) : null}
    </Box>
  )
  const shouldUsePressable = Boolean(props.onPress || props.onLongPress || props.detailMenuProps)
  const content = shouldUsePressable ? (
    <Pressable
      onPress={
        props.onPress
          ? async () => {
              setLoadingState(true)
              await props.onPress()
              setLoadingState(false)
            }
          : undefined
      }
      onLongPress={props.onLongPress}
    >
      {contentWithMenu}
    </Pressable>
  ) : (
    contentWithMenu
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
  imageContainer: {
    height: 320,
    width: 240,
    position: "relative",
  },
  cachedIconBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 999,
    borderWidth: 1,
    padding: 2,
  },
  detailMenuOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: 6,
  },
  detailMenuIcon: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 2,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
  },
})
