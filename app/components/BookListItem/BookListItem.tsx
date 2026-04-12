import {
  Box,
  Button,
  HStack,
  Image,
  type ImageProps,
  MaterialCommunityIcon,
  type MaterialCommunityIconProps,
  Text,
  VStack,
} from "@/components"
import type { Book } from "@/models/calibre/BookModel"
import { usePalette } from "@/theme"
import { typography } from "@/theme/typography"
import { Pressable } from "@gluestack-ui/themed"
import { memo } from "react"
import { StyleSheet } from "react-native"

type BookListItemProps = {
  book: Book
  source: ImageProps["source"]
  readStatus?: string
  readingProgress?: number
  isCached?: boolean
  isSelected?: boolean
  onPress?: () => void
  onLongPress?: () => void
  onSelectToggle?: () => void
  onAuthorPress?: (author: string) => void
}

type ReadStatusValue = "want-to-read" | "reading" | "finished"

const STATUS_ICON: Record<
  ReadStatusValue,
  { name: NonNullable<MaterialCommunityIconProps["name"]>; color: string }
> = {
  "want-to-read": { name: "bookmark-outline", color: "#3B82F6" },
  reading: { name: "book-open-outline", color: "#F97316" },
  finished: { name: "check-circle-outline", color: "#22C55E" },
}

// React.memo: prevents re-rendering when the list's renderItem callback
// recreates closure props but the actual values are unchanged.
export const BookListItem = memo(function BookListItem({
  book,
  source,
  readStatus,
  readingProgress,
  isCached,
  isSelected,
  onPress,
  onLongPress,
  onSelectToggle,
  onAuthorPress,
}: BookListItemProps) {
  const palette = usePalette()
  const meta = book.metaData
  const title = meta?.title ?? ""
  const authors = meta?.authors?.join(", ") ?? ""
  const authorList = meta?.authors ?? []
  const formats: string[] = meta?.formats ? [...meta.formats] : []
  const progressPct =
    typeof readingProgress === "number" && readingProgress > 0
      ? `${Math.round(readingProgress * 100)}%`
      : null
  const statusIconConfig =
    readStatus && readStatus in STATUS_ICON ? STATUS_ICON[readStatus as ReadStatusValue] : null

  return (
    <HStack
      alignItems="center"
      paddingHorizontal="$2"
      paddingVertical="$2"
      style={[
        styles.row,
        { borderBottomColor: palette.borderSubtle },
        isSelected && { backgroundColor: palette.surfaceStrong },
      ]}
    >
      {/* Selection checkbox - only shown in selection mode */}
      <Pressable onPress={onSelectToggle} style={styles.checkboxContainer}>
        <MaterialCommunityIcon
          name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
          iconSize="sm"
          color={isSelected ? "$primary500" : palette.textSecondary}
        />
      </Pressable>

      <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.rowContent}>
        <HStack alignItems="center" space="md">
          {/* Cover image */}
          <Box style={styles.coverContainer}>
            {source ? (
              <Image source={source} style={styles.cover} contentFit="fill" />
            ) : (
              <Box style={[styles.cover, { backgroundColor: palette.surfaceMuted }]} />
            )}
          </Box>

          {/* Book info */}
          <VStack flex={1} space="xs">
            <Text
              style={[
                styles.title,
                { color: palette.textPrimary, fontFamily: typography.primary.semiBold },
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {authorList.length > 0 && onAuthorPress ? (
              <HStack flexWrap="wrap" flex={1} alignItems="center">
                {authorList.map((author, index) => (
                  <HStack key={author} alignItems="center">
                    <Button variant="link" height="$5" onPress={() => onAuthorPress(author)}>
                      {author}
                    </Button>
                    {index < authorList.length - 1 && (
                      <Text style={{ color: palette.textSecondary }}>, </Text>
                    )}
                  </HStack>
                ))}
              </HStack>
            ) : authors ? (
              <Text style={[styles.authors, { color: palette.textSecondary }]} numberOfLines={1}>
                {authors}
              </Text>
            ) : null}
            {formats.length > 0 ? (
              <HStack space="xs" flexWrap="wrap">
                {formats.map((fmt) => (
                  <Box
                    key={fmt}
                    style={[
                      styles.formatBadge,
                      { backgroundColor: palette.surfaceStrong, borderColor: palette.borderStrong },
                    ]}
                  >
                    <Text style={[styles.formatBadgeText, { color: palette.textSecondary }]}>
                      {fmt.toUpperCase()}
                    </Text>
                  </Box>
                ))}
              </HStack>
            ) : null}
          </VStack>

          {/* Right: status + progress */}
          <VStack alignItems="center" space="xs">
            {isCached ? (
              <MaterialCommunityIcon
                name="cloud-check"
                iconSize="sm-"
                color={palette.textSecondary}
              />
            ) : null}
            {statusIconConfig ? (
              <MaterialCommunityIcon
                name={statusIconConfig.name}
                iconSize="sm"
                color={statusIconConfig.color}
              />
            ) : null}
            {progressPct ? (
              <Text style={[styles.progress, { color: palette.textSecondary }]}>{progressPct}</Text>
            ) : null}
          </VStack>
        </HStack>
      </Pressable>
    </HStack>
  )
})

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
  },
  coverContainer: {
    width: 48,
    height: 64,
  },
  cover: {
    width: 48,
    height: 64,
    borderRadius: 2,
  },
  title: {
    fontSize: 14,
  },
  authors: {
    fontSize: 12,
  },
  authorLink: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
  progress: {
    fontSize: 11,
  },
  formatBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  formatBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
})
