import { memo, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"

import { BookDetailMenu, type BookDetailMenuProps } from "@/components/BookDetailMenu/BookDetailMenu"
import { Box } from "@/components/Box/Box"
import { HStack } from "@/components/HStack/HStack"
import { Image, type ImageProps } from "@/components/Image/Image"
import { LabeledSpinner } from "@/components/LabeledSpinner/LabeledSpinner"
import {
  MaterialCommunityIcon,
  type MaterialCommunityIconProps,
} from "@/components/MaterialCommunityIcon/MaterialCommunityIcon"
import { Text } from "@/components/Text/Text"
import { VStack } from "@/components/VStack/VStack"
import type { MessageKey } from "@/i18n"
import { Pressable } from "@gluestack-ui/themed"

type IconName = MaterialCommunityIconProps["name"]

export type ReadStatusValue = "want-to-read" | "reading" | "finished"
export type BookImageHoverSearchMetadata = {
  authors?: string[]
  series?: string | null
  tags?: string[]
  formats?: string[]
}

type HoverSearchField = "authors" | "series" | "tags" | "formats"
type HoverSearchSection = {
  field: HoverSearchField
  titleTx: MessageKey
  links: Array<{
    label: string
    query: string
  }>
}

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
  onOpenBookDetail?: () => void
  hoverSearchMetadata?: BookImageHoverSearchMetadata
  onHoverSearchPress?: (query: string) => void | Promise<void>
  showSelectionDetails?: boolean
}

const STATUS_ICON: Record<ReadStatusValue, { name: IconName; color: string }> = {
  "want-to-read": { name: "bookmark-outline", color: "#3B82F6" },
  reading: { name: "book-open-outline", color: "#F97316" },
  finished: { name: "check-circle-outline", color: "#22C55E" },
}

const IMAGE_ITEM_WIDTH = 240
const IMAGE_ITEM_HEIGHT = 300
const DETAIL_MENU_OVERLAY_INSET = 6
const DETAIL_MENU_BUTTON_SIZE = 42
const SELECTED_OUTLINE_COLOR = "#3B82F6"
const SELECTED_OVERLAY_COLOR = "rgba(59, 130, 246, 0.12)"

function uniqNonEmpty(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value && value.length > 0)),
    ),
  )
}

function buildHoverSearchSections(metadata?: BookImageHoverSearchMetadata): HoverSearchSection[] {
  if (!metadata) {
    return []
  }

  const authors = uniqNonEmpty(metadata.authors ?? []).map((author) => ({
    label: author,
    query: `authors:=${author}`,
  }))
  const series = uniqNonEmpty([metadata.series]).map((value) => ({
    label: value,
    query: `series:=${value}`,
  }))
  const tags = uniqNonEmpty(metadata.tags ?? []).map((tag) => ({
    label: tag,
    query: `tags:=${tag}`,
  }))
  const formats = uniqNonEmpty(metadata.formats ?? []).map((format) => ({
    label: format.toUpperCase(),
    query: `formats:=${format.toUpperCase()}`,
  }))

  const sections: HoverSearchSection[] = [
    { field: "authors", titleTx: "bookImage.hoverSearchAuthors", links: authors },
    { field: "series", titleTx: "bookImage.hoverSearchSeries", links: series },
    { field: "tags", titleTx: "bookImage.hoverSearchTags", links: tags },
    { field: "formats", titleTx: "bookImage.hoverSearchFormats", links: formats },
  ]

  return sections.filter((section) => section.links.length > 0)
}

// React.memo: prevents re-rendering when parent's renderItem creates
// new closure props but all values are referentially equal.
// React Compiler handles intra-component memoization but cannot prevent
// the component function from being called when the parent re-renders.
export const BookImageItem = memo(function BookImageItem({
  loading = false,
  selected,
  onSelectToggle,
  showSelectionDetails = false,
  ...restProps
}: BookImageprops) {
  const props = { loading, selected, onSelectToggle, showSelectionDetails, ...restProps }
  const [loadingState, setLoadingState] = useState(props.loading)
  const hoverSearchSections = useMemo(
    () => buildHoverSearchSections(props.hoverSearchMetadata),
    [props.hoverSearchMetadata],
  )

  const showDetailMenu = Boolean(props.detailMenuProps && props.showSelectionDetails)
  const showHoverSearchOverlay = Boolean(
    props.onHoverSearchPress && hoverSearchSections.length > 0 && props.showSelectionDetails,
  )

  const showProgressBar =
    typeof props.readingProgress === "number" &&
    props.readingProgress > 0 &&
    props.readingProgress < 1

  const statusIconConfig = props.readStatus ? STATUS_ICON[props.readStatus] : null

  const image = <Image source={props.source} style={styles.imageSize} contentFit={"fill"} />
  const shouldUsePressable = Boolean(props.onPress || props.onLongPress || props.detailMenuProps)
  const contentWithMenu = (
    <Box testID="book-image-selection-surface" style={styles.imageContainer}>
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
            style={[styles.progressBarFill, { width: `${(props.readingProgress ?? 0) * 100}%` }]}
          />
        </View>
      ) : null}
      {showHoverSearchOverlay ? (
        <Box style={styles.hoverSearchOverlay} testID="book-image-hover-overlay">
          <VStack space="xs" alignItems="center">
            {hoverSearchSections.map((section) => (
              <VStack key={section.field} space="xs" alignItems="center">
                <Text
                  tx={section.titleTx}
                  fontSize="$2xs"
                  style={styles.hoverSearchTitle}
                  testID={`book-image-hover-title-${section.field}`}
                />
                <HStack style={styles.hoverSearchLinkRow}>
                  {section.links.map((link) => (
                    <Pressable
                      key={`${section.field}-${link.query}`}
                      testID={`book-image-hover-link-${section.field}-${link.label}`}
                      style={styles.hoverSearchLinkButton}
                      onPress={async (event) => {
                        event?.stopPropagation?.()
                        event?.preventDefault?.()
                        if (props.onHoverSearchPress) {
                          await props.onHoverSearchPress(link.query)
                        }
                      }}
                    >
                      <Text style={styles.hoverSearchLinkText}>{link.label}</Text>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>
            ))}
          </VStack>
        </Box>
      ) : null}
      {showDetailMenu ? (
        <Box style={styles.detailMenuOverlay} testID="book-image-detail-menu-overlay">
          <BookDetailMenu
            {...props.detailMenuProps}
            onOpenBookDetail={props.onOpenBookDetail ?? (() => {})}
            wrap
            iconOpacity={0.85}
            containerProps={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            iconButtonProps={{ style: styles.detailMenuIcon }}
          />
        </Box>
      ) : null}
    </Box>
  )
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
      {selected ? (
        <Box
          style={styles.selectedOverlay}
          pointerEvents="none"
          testID="book-image-selected-outline"
        />
      ) : null}
    </Box>
  )
})

const styles = StyleSheet.create({
  imageSize: {
    height: IMAGE_ITEM_HEIGHT,
    width: IMAGE_ITEM_WIDTH,
  },
  imageContainer: {
    height: IMAGE_ITEM_HEIGHT,
    width: IMAGE_ITEM_WIDTH,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
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
    left: DETAIL_MENU_OVERLAY_INSET,
    right: DETAIL_MENU_OVERLAY_INSET,
    bottom: 0,
    alignItems: "stretch",
    justifyContent: "center",
    paddingBottom: 8,
    paddingTop: 8,
  },
  hoverSearchOverlay: {
    position: "absolute",
    top: 28,
    left: 6,
    right: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  hoverSearchTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.85,
  },
  hoverSearchLinkRow: {
    flexWrap: "wrap",
    justifyContent: "center",
  },
  hoverSearchLinkButton: {
    minHeight: 20,
    marginHorizontal: 2,
    marginVertical: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  hoverSearchLinkText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
  },
  detailMenuIcon: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 2,
    marginVertical: 2,
    padding: 2,
    width: DETAIL_MENU_BUTTON_SIZE,
    height: DETAIL_MENU_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SELECTED_OVERLAY_COLOR,
    borderWidth: 3,
    borderColor: SELECTED_OUTLINE_COLOR,
    borderRadius: 10,
    pointerEvents: "none",
  },
})
