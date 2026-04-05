import { IconButton } from "@/components/IconButton/IconButton"
import { Text } from "@/components/Text/Text"
import { translate } from "@/i18n"
import type { Book } from "@/models/calibre"
import { HStack, View } from "@gluestack-ui/themed"
import { StyleSheet } from "react-native"

type SeriesNavigationBarProps = {
  prevBook: Book | null
  nextBook: Book | null
  currentIndex: number
  totalCount: number
  seriesName: string | null
  onPrev: () => void
  onNext: () => void
}

export function SeriesNavigationBar({
  prevBook,
  nextBook,
  currentIndex,
  totalCount,
  seriesName,
  onPrev,
  onNext,
}: SeriesNavigationBarProps) {
  const centerLabel = seriesName
    ? translate("seriesNavigation.bookOfTotal", { current: currentIndex + 1, total: totalCount })
    : null

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      paddingHorizontal="$3"
      paddingVertical="$2"
      space="sm"
    >
      {prevBook ? (
        <HStack alignItems="center" space="xs" style={styles.sideContainer}>
          <IconButton name="chevron-left" iconSize="md-" onPress={onPrev} />
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={styles.sideText}>
              {prevBook.metaData?.title ?? translate("seriesNavigation.prevBook")}
            </Text>
          </View>
        </HStack>
      ) : (
        <View style={styles.sideContainer} />
      )}

      {centerLabel ? (
        <Text style={styles.centerText}>{centerLabel}</Text>
      ) : null}

      {nextBook ? (
        <HStack alignItems="center" justifyContent="flex-end" space="xs" style={styles.sideContainer}>
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={[styles.sideText, styles.rightText]}>
              {nextBook.metaData?.title ?? translate("seriesNavigation.nextBook")}
            </Text>
          </View>
          <IconButton name="chevron-right" iconSize="md-" onPress={onNext} />
        </HStack>
      ) : (
        <View style={styles.sideContainer} />
      )}
    </HStack>
  )
}

const styles = StyleSheet.create({
  sideContainer: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  sideText: {
    fontSize: 13,
  },
  rightText: {
    textAlign: "right",
  },
  centerText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0,
  },
})
