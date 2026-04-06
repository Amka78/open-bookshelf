import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"

import {
  BookDetailMenu,
  Box,
  Image,
  type ImageProps,
  LabeledSpinner,
  MaterialCommunityIcon,
  type MaterialCommunityIconProps,
} from "@/components"
import type { BookDetailMenuProps } from "@/components"
import { Pressable } from "@gluestack-ui/themed"

type IconName = MaterialCommunityIconProps["name"]

export type ReadStatusValue = "want-to-read" | "reading" | "finished"

export type BookImageprops = Pick<ImageProps, "source"> & {
  onPress?: () => Promise<void>
  onLongPress?: () => void
  onCachedIconPress?: () => void
  loading?: boolean
  detailMenuProps?: BookDetailMenuProps
  showCachedIcon?: boolean
  selected?: boolean
  onSelectToggle?: () => void
  readingProgress?: number | null
  readStatus?: ReadStatusValue | null
}

const STATUS_ICON: Record<ReadStatusValue, { name: IconName; color: string }> = {
  "want-to-read": { name: "bookmark-outline", color: "#3B82F6" },
  reading: { name: "book-open-outline", color: "#F97316" },
  finished: { name: "check-circle-outline", color: "#22C55E" },
}

export function BookImageItem({
  loading = false,
  selected,
  onSelectToggle,
  ...restProps
}: BookImageprops) {
  const props = { loading, selected, onSelectToggle, ...restProps }
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

  const showProgressBar =
    typeof props.readingProgress === "number" &&
    props.readingProgress > 0 &&
    props.readingProgress < 1

  const statusIconConfig = props.readStatus ? STATUS_ICON[props.readStatus] : null

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
      {statusIconConfig ? (
        <View style={styles.statusBadge}>
          <MaterialCommunityIcon
            name={statusIconConfig.name}
            iconSize="sm"
            color={statusIconConfig.color}
          />
        </View>
      ) : null}
      {showProgressBar ? (
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${props.readingProgress! * 100}%` }]}
          />
        </View>
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

  const selectionOverlay = onSelectToggle ? (
    <Pressable onPress={onSelectToggle} style={styles.selectionArea}>
      <MaterialCommunityIcon
        name={selected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
        iconSize="sm"
        color={selected ? "$primary500" : "$textLight400"}
      />
    </Pressable>
  ) : null

  return (
    <Box marginHorizontal={"$2"} marginTop={"$2"}>
      {selectionOverlay}
      {loading || loadingState ? (
        <LabeledSpinner
          containerStyle={styles.imageSize}
          labelTx={"bookImage.loading"}
          labelDirection="vertical"
        />
      ) : (
        content
      )}
      {selected ? <Box style={styles.selectedOverlay} pointerEvents="none" /> : null}
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
  statusBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 999,
    borderWidth: 1,
    padding: 2,
  },
  progressBarBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#3B82F6",
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
  selectionArea: {
    height: 28,
    width: 240,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  selectedOverlay: {
    position: "absolute",
    top: 28,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(59,130,246,0.18)",
    borderWidth: 2,
    borderColor: "rgba(59,130,246,0.7)",
    pointerEvents: "none",
  },
})
