import { BookDetailMenu, Box, Button, HStack, Image, Input, ScrollView, Text, VStack } from "@/components"
import type { BookDetailMenuProps, ImageProps } from "@/components"
import { InputField } from "@/components/InputField/InputField"
import type { Book, FieldMetadataMap, MetadataSnapshotIn } from "@/models/calibre"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { Pressable } from "@gluestack-ui/themed"

const BOOK_COLUMN_WIDTH = 150
const TITLE_COLUMN_WIDTH = 180
const AUTHORS_COLUMN_WIDTH = 180
const SERIES_COLUMN_WIDTH = 150
const TAGS_COLUMN_WIDTH = 180
const PUBLISHER_COLUMN_WIDTH = 150
const ACTIONS_COLUMN_WIDTH = 90
const SELECTED_OUTLINE_COLOR = "#3B82F6"
const SELECTED_OVERLAY_COLOR = "rgba(59, 130, 246, 0.08)"

export const LIBRARY_TABLE_MIN_WIDTH =
  BOOK_COLUMN_WIDTH +
  TITLE_COLUMN_WIDTH +
  AUTHORS_COLUMN_WIDTH +
  SERIES_COLUMN_WIDTH +
  TAGS_COLUMN_WIDTH +
  PUBLISHER_COLUMN_WIDTH +
  ACTIONS_COLUMN_WIDTH

type LibraryTableFieldLabels = {
  book: string
  title: string
  authors: string
  series: string
  tags: string
  publisher: string
  actions: string
}

type LibraryTableHeaderProps = {
  labels: LibraryTableFieldLabels
}

type LibraryTableItemProps = {
  book: Book
  source: ImageProps["source"]
  libraryId: string
  isSelected: boolean
  showSelectionActions?: boolean
  detailMenuProps?: BookDetailMenuProps
  onPress?: () => void
  onLongPress?: () => void
}

function joinList(values: Array<string | null | undefined> | undefined): string {
  return (values ?? [])
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .join(", ")
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeNullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getFieldName(fieldMetadataList: FieldMetadataMap, key: string, fallback: string): string {
  return fieldMetadataList.get(key)?.name ?? fallback
}

export function createLibraryTableFieldLabels(fieldMetadataList: FieldMetadataMap): LibraryTableFieldLabels {
  return {
    book: "Book",
    title: getFieldName(fieldMetadataList, "title", "Title"),
    authors: getFieldName(fieldMetadataList, "authors", "Authors"),
    series: getFieldName(fieldMetadataList, "series", "Series"),
    tags: getFieldName(fieldMetadataList, "tags", "Tags"),
    publisher: getFieldName(fieldMetadataList, "publisher", "Publisher"),
    actions: "Actions",
  }
}

export function LibraryTableHeader({ labels }: LibraryTableHeaderProps) {
  return (
    <HStack style={styles.headerRow}>
      <Box style={[styles.headerCell, styles.bookCell]}>
        <Text fontWeight="$bold">{labels.book}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.titleCell]}>
        <Text fontWeight="$bold">{labels.title}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.authorsCell]}>
        <Text fontWeight="$bold">{labels.authors}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.seriesCell]}>
        <Text fontWeight="$bold">{labels.series}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.tagsCell]}>
        <Text fontWeight="$bold">{labels.tags}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.publisherCell]}>
        <Text fontWeight="$bold">{labels.publisher}</Text>
      </Box>
      <Box style={[styles.headerCell, styles.actionsCell]}>
        <Text fontWeight="$bold">{labels.actions}</Text>
      </Box>
    </HStack>
  )
}

export const LibraryTableItem = observer(function LibraryTableItem({
  book,
  source,
  libraryId,
  isSelected,
  showSelectionActions = false,
  detailMenuProps,
  onPress,
  onLongPress,
}: LibraryTableItemProps) {
  const [title, setTitle] = useState(book.metaData.title ?? "")
  const [authors, setAuthors] = useState(joinList(book.metaData.authors))
  const [series, setSeries] = useState(book.metaData.series ?? "")
  const [tags, setTags] = useState(joinList(book.metaData.tags))
  const [publisher, setPublisher] = useState(book.metaData.publisher ?? "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(book.metaData.title ?? "")
    setAuthors(joinList(book.metaData.authors))
    setSeries(book.metaData.series ?? "")
    setTags(joinList(book.metaData.tags))
    setPublisher(book.metaData.publisher ?? "")
  }, [
    book.metaData.authors,
    book.metaData.publisher,
    book.metaData.series,
    book.metaData.tags,
    book.metaData.title,
  ])

  const currentValue = useMemo(
    () => ({
      title: title.trim(),
      authors: splitList(authors),
      publisher: normalizeNullableText(publisher),
      series: normalizeNullableText(series),
      tags: splitList(tags),
    }),
    [authors, publisher, series, tags, title],
  )

  const originalValue = useMemo(
    () => ({
      title: String(book.metaData.title ?? "").trim(),
      authors: (book.metaData.authors ?? []).map((entry) => String(entry ?? "").trim()).filter(Boolean),
      publisher: book.metaData.publisher ? String(book.metaData.publisher).trim() : null,
      series: book.metaData.series ? String(book.metaData.series).trim() : null,
      tags: (book.metaData.tags ?? []).map((entry) => String(entry ?? "").trim()).filter(Boolean),
    }),
    [book.metaData.authors, book.metaData.publisher, book.metaData.series, book.metaData.tags, book.metaData.title],
  )

  const isDirty = useMemo(() => {
    return JSON.stringify(currentValue) !== JSON.stringify(originalValue)
  }, [currentValue, originalValue])

  const handleSave = async () => {
    if (!isDirty || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      const updateInfo: Partial<MetadataSnapshotIn> = {
        authors: currentValue.authors,
        publisher: currentValue.publisher,
        series: currentValue.series,
        tags: currentValue.tags,
        title: currentValue.title,
      }

      await book.update(libraryId, updateInfo, ["title", "authors", "series", "tags", "publisher"])
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <VStack
      style={[
        styles.rowContainer,
        isSelected ? styles.rowSelected : undefined,
      ]}
      testID={`library-table-row-${book.id}`}
    >
      <HStack alignItems="center">
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.bookCell}
          testID={`library-table-select-${book.id}`}
        >
          {source ? (
            <Image source={source} style={styles.cover} contentFit="fill" />
          ) : (
            <Box style={styles.coverPlaceholder} />
          )}
          <Text numberOfLines={2} style={styles.bookTitle}>
            {book.metaData.title ?? ""}
          </Text>
        </Pressable>
        <Box style={styles.titleCell}>
          <Input size="sm">
            <InputField
              value={title}
              onChangeText={setTitle}
              testID={`library-table-title-${book.id}`}
            />
          </Input>
        </Box>
        <Box style={styles.authorsCell}>
          <Input size="sm">
            <InputField
              value={authors}
              onChangeText={setAuthors}
              testID={`library-table-authors-${book.id}`}
            />
          </Input>
        </Box>
        <Box style={styles.seriesCell}>
          <Input size="sm">
            <InputField
              value={series}
              onChangeText={setSeries}
              testID={`library-table-series-${book.id}`}
            />
          </Input>
        </Box>
        <Box style={styles.tagsCell}>
          <Input size="sm">
            <InputField
              value={tags}
              onChangeText={setTags}
              testID={`library-table-tags-${book.id}`}
            />
          </Input>
        </Box>
        <Box style={styles.publisherCell}>
          <Input size="sm">
            <InputField
              value={publisher}
              onChangeText={setPublisher}
              testID={`library-table-publisher-${book.id}`}
            />
          </Input>
        </Box>
        <Box style={styles.actionsCell}>
          <Button
            tx="bookEditScreen.save"
            size="sm"
            onPress={handleSave}
            isDisabled={!isDirty || isSaving}
            testID={`library-table-save-${book.id}`}
          />
        </Box>
      </HStack>
      {showSelectionActions && detailMenuProps ? (
        <Box style={styles.selectionActions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BookDetailMenu
              {...detailMenuProps}
              iconOpacity={0.9}
              containerProps={{
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </ScrollView>
        </Box>
      ) : null}
      {isSelected ? (
        <Box
          pointerEvents="none"
          style={styles.selectedOutline}
          testID={`library-table-selected-outline-${book.id}`}
        />
      ) : null}
    </VStack>
  )
})

const styles = StyleSheet.create({
  headerRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  headerCell: {
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  rowContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: "relative",
    paddingVertical: 8,
  },
  rowSelected: {
    backgroundColor: SELECTED_OVERLAY_COLOR,
  },
  bookCell: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 6,
    width: BOOK_COLUMN_WIDTH,
  },
  titleCell: {
    paddingHorizontal: 6,
    width: TITLE_COLUMN_WIDTH,
  },
  authorsCell: {
    paddingHorizontal: 6,
    width: AUTHORS_COLUMN_WIDTH,
  },
  seriesCell: {
    paddingHorizontal: 6,
    width: SERIES_COLUMN_WIDTH,
  },
  tagsCell: {
    paddingHorizontal: 6,
    width: TAGS_COLUMN_WIDTH,
  },
  publisherCell: {
    paddingHorizontal: 6,
    width: PUBLISHER_COLUMN_WIDTH,
  },
  actionsCell: {
    paddingHorizontal: 6,
    width: ACTIONS_COLUMN_WIDTH,
  },
  cover: {
    borderRadius: 2,
    height: 48,
    marginRight: 8,
    width: 36,
  },
  coverPlaceholder: {
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 2,
    height: 48,
    marginRight: 8,
    width: 36,
  },
  bookTitle: {
    flex: 1,
    fontSize: 12,
  },
  selectionActions: {
    marginTop: 8,
    paddingHorizontal: 6,
  },
  selectedOutline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: SELECTED_OUTLINE_COLOR,
    borderRadius: 10,
    borderWidth: 2,
    pointerEvents: "none",
  },
})
