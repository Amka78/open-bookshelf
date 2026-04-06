import { Box, HStack, Image, type ImageProps, MaterialCommunityIcon, VStack } from "@/components"
import type { Book } from "@/models/calibre/BookModel"
import { Pressable, Text } from "@gluestack-ui/themed"
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
}

type ReadStatusValue = "want-to-read" | "reading" | "finished"

const STATUS_ICON: Record<ReadStatusValue, { name: string; color: string }> = {
  "want-to-read": { name: "bookmark-outline", color: "#3B82F6" },
  reading: { name: "book-open-outline", color: "#F97316" },
  finished: { name: "check-circle-outline", color: "#22C55E" },
}

const FORMAT_COLORS: Record<string, string> = {
  EPUB: "#3B82F6",
  PDF: "#EF4444",
  MOBI: "#F97316",
  AZW3: "#8B5CF6",
  CBZ: "#10B981",
  CBR: "#10B981",
}

export function BookListItem({
  book,
  source,
  readStatus,
  readingProgress,
  isCached,
  isSelected,
  onPress,
  onLongPress,
}: BookListItemProps) {
  const meta = book.metaData
  const title = meta?.title ?? ""
  const authors = meta?.authors?.join(", ") ?? ""
  const formats = meta?.formats ?? []
  const progressPct =
    typeof readingProgress === "number" && readingProgress > 0
      ? `${Math.round(readingProgress * 100)}%`
      : null
  const statusIconConfig =
    readStatus && readStatus in STATUS_ICON
      ? STATUS_ICON[readStatus as ReadStatusValue]
      : null

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <HStack
        alignItems="center"
        paddingHorizontal="$3"
        paddingVertical="$2"
        space="md"
        style={[styles.row, isSelected && styles.selectedRow]}
      >
        {/* Cover image */}
        <Box style={styles.coverContainer}>
          {source ? (
            <Image source={source} style={styles.cover} contentFit="fill" />
          ) : (
            <Box style={[styles.cover, styles.coverPlaceholder]} />
          )}
        </Box>

        {/* Book info */}
        <VStack flex={1} space="xs">
          <Text
            fontWeight="$bold"
            fontSize="$sm"
            numberOfLines={2}
            lineBreakMode="tail"
          >
            {title}
          </Text>
          {authors ? (
            <Text fontSize="$xs" color="$textLight600" numberOfLines={1}>
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
                    { backgroundColor: FORMAT_COLORS[fmt.toUpperCase()] ?? "#6B7280" },
                  ]}
                >
                  <Text style={styles.formatBadgeText}>{fmt.toUpperCase()}</Text>
                </Box>
              ))}
            </HStack>
          ) : null}
        </VStack>

        {/* Right: status + progress */}
        <VStack alignItems="center" space="xs">
          {isCached ? (
            <MaterialCommunityIcon name="cloud-check" iconSize="sm-" color="#6B7280" />
          ) : null}
          {statusIconConfig ? (
            <MaterialCommunityIcon
              name={statusIconConfig.name as any}
              iconSize="sm"
              color={statusIconConfig.color}
            />
          ) : null}
          {progressPct ? (
            <Text fontSize="$xs" color="$textLight500">
              {progressPct}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  selectedRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(59,130,246,0.1)",
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
  coverPlaceholder: {
    backgroundColor: "#E5E7EB",
  },
  formatBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  formatBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
})
