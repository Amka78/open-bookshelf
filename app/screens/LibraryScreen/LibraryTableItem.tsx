import {
  BookDetailMenu,
  type BookDetailMenuProps,
  Box,
  Checkbox,
  HStack,
  IconButton,
  Image,
  type ImageProps,
  Input,
  InputField,
  ScrollView,
  TagInput,
  Text,
  VStack,
} from "@/components"
import { RatingGroup } from "@/components/RatingGroup/RatingGroup"
import type { Book, FieldMetadataMap, MetadataSnapshotIn } from "@/models/calibre"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { usePalette } from "@/theme"
import { Pressable } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo, useRef, useState } from "react"
import { PanResponder, Platform, StyleSheet, View, type ViewStyle } from "react-native"

const BOOK_COLUMN_WIDTH = 150
const TITLE_COLUMN_WIDTH = 180
const AUTHORS_COLUMN_WIDTH = 180
const SERIES_NAME_COLUMN_WIDTH = 120
const SERIES_INDEX_COLUMN_WIDTH = 60
const TAGS_COLUMN_WIDTH = 180
const PUBLISHER_COLUMN_WIDTH = 150
const SELECTED_OUTLINE_COLOR = "#3B82F6"
const SELECTED_OVERLAY_COLOR = "rgba(59, 130, 246, 0.08)"
const COPIED_BACKGROUND_COLOR = "rgba(34, 197, 94, 0.12)"

// Metadata columns whose width the user can change by dragging the header border.
export type LibraryTableColumnKey =
  | "title"
  | "authors"
  | "seriesName"
  | "seriesIndex"
  | "tags"
  | "publisher"

export type LibraryTableColumnWidths = Record<LibraryTableColumnKey, number>

export type LibraryTableColumnVisibility = Record<string, boolean>

export const LIBRARY_TABLE_COLUMN_MIN_WIDTH = 60
export const LIBRARY_TABLE_COLUMN_MAX_WIDTH = 600

export const DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS: LibraryTableColumnWidths = {
  title: TITLE_COLUMN_WIDTH,
  authors: AUTHORS_COLUMN_WIDTH,
  seriesName: SERIES_NAME_COLUMN_WIDTH,
  seriesIndex: SERIES_INDEX_COLUMN_WIDTH,
  tags: TAGS_COLUMN_WIDTH,
  publisher: PUBLISHER_COLUMN_WIDTH,
}

export function clampColumnWidth(
  width: number,
  min: number = LIBRARY_TABLE_COLUMN_MIN_WIDTH,
  max: number = LIBRARY_TABLE_COLUMN_MAX_WIDTH,
): number {
  if (!Number.isFinite(width)) return min
  return Math.min(max, Math.max(min, Math.round(width)))
}

export function computeLibraryTableMinWidth(
  widths: LibraryTableColumnWidths = DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS,
): number {
  return (
    BOOK_COLUMN_WIDTH +
    widths.title +
    widths.authors +
    widths.seriesName +
    widths.seriesIndex +
    widths.tags +
    widths.publisher
  )
}

export const LIBRARY_TABLE_MIN_WIDTH = computeLibraryTableMinWidth()

const resizeHandleWebStyle = { cursor: "col-resize" } as unknown as ViewStyle

type LibraryTableFieldLabels = {
  book: string
  title: string
  authors: string
  seriesName: string
  seriesIndex: string
  tags: string
  publisher: string
}

type CustomColumn = {
  key: string
  label: string
  datatype: string
  isMultiple: boolean
}

type LibraryTableHeaderProps = {
  labels: LibraryTableFieldLabels
  columnWidths?: LibraryTableColumnWidths
  columnVisibility?: LibraryTableColumnVisibility
  onColumnResize?: (column: LibraryTableColumnKey, width: number) => void
  onColumnVisibilityChange?: (column: string, visible: boolean) => void
  customColumns?: CustomColumn[]
}

type ResizeHandleProps = {
  column: LibraryTableColumnKey
  width: number
  onResize: (column: LibraryTableColumnKey, width: number) => void
  offsetRight?: number
}

function ResizeHandle({ column, width, onResize, offsetRight = -6 }: ResizeHandleProps) {
  const widthRef = useRef(width)
  widthRef.current = width
  const startWidthRef = useRef(width)
  const startPageXRef = useRef(0)

  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          startWidthRef.current = widthRef.current
          startPageXRef.current = event.nativeEvent.pageX
        },
        onPanResponderMove: (event) => {
          const delta = event.nativeEvent.pageX - startPageXRef.current
          onResizeRef.current(column, clampColumnWidth(startWidthRef.current + delta))
        },
      }),
    [column],
  )

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.resizeHandle,
        { right: offsetRight },
        Platform.OS === "web" ? resizeHandleWebStyle : undefined,
      ]}
      testID={`library-table-resize-${column}`}
    >
      <View style={styles.resizeHandleGrip} />
    </View>
  )
}

type LibraryTableItemProps = {
  book: Book
  source: ImageProps["source"]
  libraryId: string
  isSelected: boolean
  columnWidths?: LibraryTableColumnWidths
  columnVisibility?: LibraryTableColumnVisibility
  showSelectionActions?: boolean
  detailMenuProps?: BookDetailMenuProps
  fieldMetadataList?: FieldMetadataMap
  customColumns?: CustomColumn[]
  onPress?: () => void
  onLongPress?: () => void
}

function normalizeNullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

// Extract series name and number from title
// Patterns: "Dune 1", "Foundation Vol.2", "指輪物語 01", "Series 第1巻"
const SERIES_PATTERN = /^(.+?)\s+(\d+|[Vv]ol\.?\s*\d+|第\s*\d+\s*巻)$/

export function extractSeriesFromTitle(title: string): { series: string; number: string } | null {
  const match = title.trim().match(SERIES_PATTERN)
  if (!match) return null
  return {
    series: match[1].trim(),
    number: match[2].trim(),
  }
}

function getFieldName(fieldMetadataList: FieldMetadataMap, key: string, fallback: string): string {
  return fieldMetadataList.get(key)?.name ?? fallback
}

export function createLibraryTableFieldLabels(
  fieldMetadataList: FieldMetadataMap,
): LibraryTableFieldLabels {
  return {
    book: "Book",
    title: getFieldName(fieldMetadataList, "title", "Title"),
    authors: getFieldName(fieldMetadataList, "authors", "Authors"),
    seriesName: getFieldName(fieldMetadataList, "series", "Series"),
    seriesIndex: getFieldName(fieldMetadataList, "series", "Series"),
    tags: getFieldName(fieldMetadataList, "tags", "Tags"),
    publisher: getFieldName(fieldMetadataList, "publisher", "Publisher"),
  }
}

export const LibraryTableHeader = observer(function LibraryTableHeader({
  labels,
  columnWidths = DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS,
  columnVisibility,
  onColumnResize,
  onColumnVisibilityChange,
  customColumns,
}: LibraryTableHeaderProps) {
  const modal = useElectrobunModal()

  const isVisible = (key: string): boolean => {
    if (!columnVisibility) return true
    return columnVisibility[key] !== false
  }

  const handleOpenColumnVisibility = () => {
    if (!onColumnVisibilityChange) return
    const columns = (
      [
        { key: "title", label: labels.title },
        { key: "authors", label: labels.authors },
        { key: "seriesName", label: labels.seriesName },
        { key: "seriesIndex", label: labels.seriesIndex },
        { key: "tags", label: labels.tags },
        { key: "publisher", label: labels.publisher },
      ] as Array<{ key: string; label: string }>
    ).concat(customColumns ?? [])
    modal.openModal("ColumnVisibilityModal", {
      columns,
      visibility: columnVisibility ?? {},
      onToggle: onColumnVisibilityChange,
    })
  }

  const renderResizableHeaderCell = (
    column: LibraryTableColumnKey,
    label: string,
    cellStyle: ViewStyle,
  ) => {
    if (!isVisible(column)) return null
    return (
      <Box style={[styles.headerCell, cellStyle, { width: columnWidths[column] }]}>
        <Text fontWeight="$bold">{label}</Text>
        {onColumnResize ? (
          <ResizeHandle column={column} width={columnWidths[column]} onResize={onColumnResize} />
        ) : null}
      </Box>
    )
  }

  const seriesGroupWidth = columnWidths.seriesName + columnWidths.seriesIndex
  const showSeriesGroup = isVisible("seriesName") || isVisible("seriesIndex")

  return (
    <HStack style={styles.headerRow}>
      <Box style={[styles.headerCell, styles.bookCell]}>
        <Text fontWeight="$bold">{labels.book}</Text>
      </Box>
      {renderResizableHeaderCell("title", labels.title, styles.titleCell)}
      {renderResizableHeaderCell("authors", labels.authors, styles.authorsCell)}
      {showSeriesGroup ? (
        <Box
          style={[
            styles.headerCell,
            styles.seriesGroupCell,
            { width: seriesGroupWidth },
          ]}
        >
          <Text fontWeight="$bold">{labels.seriesName}</Text>
          {onColumnResize ? (
            <>
              {isVisible("seriesName") && (
                <ResizeHandle
                  column="seriesName"
                  width={columnWidths.seriesName}
                  onResize={onColumnResize}
                  offsetRight={columnWidths.seriesIndex - 6}
                />
              )}
              {isVisible("seriesIndex") && (
                <ResizeHandle
                  column="seriesIndex"
                  width={columnWidths.seriesIndex}
                  onResize={onColumnResize}
                />
              )}
            </>
          ) : null}
        </Box>
      ) : null}
      {renderResizableHeaderCell("tags", labels.tags, styles.tagsCell)}
      {renderResizableHeaderCell("publisher", labels.publisher, styles.publisherCell)}
      {customColumns?.map((col) =>
        isVisible(col.key) ? (
          <Box key={col.key} style={[styles.headerCell, styles.customColumnCell]}>
            <Text fontWeight="$bold">{col.label}</Text>
          </Box>
        ) : null,
      )}
      {onColumnVisibilityChange ? (
        <Box style={[styles.headerCell, styles.columnMenuCell]}>
          <IconButton
            name="cog"
            iconSize="sm"
            onPress={handleOpenColumnVisibility}
            testID="library-table-column-settings"
          />
        </Box>
      ) : null}
    </HStack>
  )
})

export const LibraryTableItem = observer(function LibraryTableItem({
  book,
  source,
  libraryId,
  isSelected,
  columnWidths = DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS,
  columnVisibility,
  showSelectionActions = false,
  detailMenuProps,
  fieldMetadataList,
  customColumns,
  onPress,
  onLongPress,
}: LibraryTableItemProps) {
  const palette = usePalette()
  const [title, setTitle] = useState(book.metaData!.title ?? "")
  const [authors, setAuthors] = useState<string[]>(book.metaData!.authors ?? [])
  const [series, setSeries] = useState(book.metaData!.series ?? "")
  const [seriesIndex, setSeriesIndex] = useState<number | null>(book.metaData!.seriesIndex ?? null)
  const [tags, setTags] = useState<string[]>(book.metaData!.tags ?? [])
  const [publisher, setPublisher] = useState(book.metaData!.publisher ?? "")
  const [customColumnValues, setCustomColumnValues] = useState<Map<string, unknown>>(() => {
    const map = new Map<string, unknown>()
    customColumns?.forEach((col) => {
      map.set(col.key, book.metaData?.customColumns?.get(col.key) ?? null)
    })
    return map
  })
  const [isSaving, setIsSaving] = useState(false)
  const [copiedField, setCopiedField] = useState<"authors" | "tags" | null>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isVisible = (key: string): boolean => {
    if (!columnVisibility) return true
    return columnVisibility[key] !== false
  }

  useEffect(() => {
    setTitle(book.metaData!.title ?? "")
    setAuthors(book.metaData!.authors ?? [])
    setSeries(book.metaData!.series ?? "")
    setSeriesIndex(book.metaData!.seriesIndex ?? null)
    setTags(book.metaData!.tags ?? [])
    setPublisher(book.metaData!.publisher ?? "")
    setCustomColumnValues((prev) => {
      const next = new Map(prev)
      customColumns?.forEach((col) => {
        next.set(col.key, book.metaData?.customColumns?.get(col.key) ?? null)
      })
      return next
    })
  }, [
    book.metaData!.authors,
    book.metaData!.publisher,
    book.metaData!.series,
    book.metaData!.seriesIndex,
    book.metaData!.tags,
    book.metaData!.title,
    book.metaData!.customColumns,
    customColumns,
  ])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const currentValue = useMemo(
    () => ({
      title: title.trim(),
      authors: authors.map((entry) => String(entry ?? "").trim()).filter(Boolean),
      publisher: normalizeNullableText(publisher),
      series: normalizeNullableText(series),
      seriesIndex: seriesIndex,
      tags: tags.map((entry) => String(entry ?? "").trim()).filter(Boolean),
    }),
    [authors, publisher, series, seriesIndex, tags, title],
  )

  const originalValue = useMemo(
    () => ({
      title: String(book.metaData!.title ?? "").trim(),
      authors: (book.metaData!.authors ?? [])
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean),
      publisher: book.metaData!.publisher ? String(book.metaData!.publisher).trim() : null,
      series: book.metaData!.series ? String(book.metaData!.series).trim() : null,
      seriesIndex: book.metaData!.seriesIndex ?? null,
      tags: (book.metaData!.tags ?? []).map((entry) => String(entry ?? "").trim()).filter(Boolean),
    }),
    [
      book.metaData!.authors,
      book.metaData!.publisher,
      book.metaData!.series,
      book.metaData!.seriesIndex,
      book.metaData!.tags,
      book.metaData!.title,
    ],
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
        seriesIndex: currentValue.seriesIndex,
        tags: currentValue.tags,
        title: currentValue.title,
      }

      // Convert fieldMetadataList to a plain Map for BookModel.update
      const metadataMap = fieldMetadataList
        ? new Map(
            Array.from(fieldMetadataList.entries()).map(([key, value]) => [
              key,
              { isMultiple: value.isMultiple },
            ]),
          )
        : undefined

      await book.update(
        libraryId,
        updateInfo,
        ["title", "authors", "series", "seriesIndex", "tags", "publisher"],
        undefined,
        metadataMap,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomColumnSave = async (columnKey: string) => {
    if (isSaving) return
    const value = customColumnValues.get(columnKey)
    const originalValue = book.metaData?.customColumns?.get(columnKey) ?? null
    if (value === originalValue) return

    setIsSaving(true)
    try {
      const updateInfo: Partial<MetadataSnapshotIn> = {
        customColumns: { [columnKey]: value },
      }
      const metadataMap = fieldMetadataList
        ? new Map(
            Array.from(fieldMetadataList.entries()).map(([key, value]) => [
              key,
              { isMultiple: value.isMultiple },
            ]),
          )
        : undefined
      await book.update(libraryId, updateInfo, ["customColumns"], undefined, metadataMap)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldCopy = (field: "authors" | "tags") => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
    }
    setCopiedField(field)
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedField(null)
      copyTimeoutRef.current = null
    }, 600)
  }

  return (
    <VStack
      style={[styles.rowContainer, isSelected ? styles.rowSelected : undefined]}
      testID={`library-table-row-${book.id}`}
    >
      <HStack alignItems="center">
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          style={[
            styles.bookCell,
            { backgroundColor: isSelected ? SELECTED_OVERLAY_COLOR : palette.bg0 },
          ]}
          testID={`library-table-select-${book.id}`}
        >
          {source ? (
            <Image source={source} style={styles.cover} contentFit="fill" />
          ) : (
            <Box style={styles.coverPlaceholder} />
          )}
        </Pressable>
        {isVisible("title") ? (
          <Box
            style={[
              styles.titleCell,
              { width: columnWidths.title },
              { backgroundColor: isSelected ? SELECTED_OVERLAY_COLOR : palette.bg0 },
            ]}
          >
            <HStack alignItems="center" space="xs">
              <Box flex={1}>
                <Input size="sm">
                  <InputField
                    value={title}
                    onChangeText={setTitle}
                    onBlur={handleSave}
                    onSubmitEditing={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave()
                      }
                    }}
                    testID={`library-table-title-${book.id}`}
                  />
                </Input>
              </Box>
              {extractSeriesFromTitle(title) && !series && (
                <IconButton
                  name="arrow-right"
                  iconSize="sm"
                  onPress={async () => {
                    const extracted = extractSeriesFromTitle(title)
                    if (extracted) {
                      // Extract number from the extracted.number (e.g., "1", "Vol.2", "第1巻")
                      const numMatch = extracted.number.match(/(\d+)/)
                      const newSeriesIndex = numMatch ? Number(numMatch[1]) : null

                      setSeries(extracted.series)
                      if (newSeriesIndex !== null) {
                        setSeriesIndex(newSeriesIndex)
                      }

                      // Directly save with the new values since state hasn't updated yet
                      if (isSaving) return
                      setIsSaving(true)
                      try {
                        const updateInfo: Partial<MetadataSnapshotIn> = {
                          authors: currentValue.authors,
                          publisher: currentValue.publisher,
                          series: extracted.series,
                          seriesIndex: newSeriesIndex,
                          tags: currentValue.tags,
                          title: currentValue.title,
                        }

                        const metadataMap = fieldMetadataList
                          ? new Map(
                              Array.from(fieldMetadataList.entries()).map(([key, value]) => [
                                key,
                                { isMultiple: value.isMultiple },
                              ]),
                            )
                          : undefined

                        await book.update(
                          libraryId,
                          updateInfo,
                          ["title", "authors", "series", "seriesIndex", "tags", "publisher"],
                          undefined,
                          metadataMap,
                        )
                      } finally {
                        setIsSaving(false)
                      }
                    }
                  }}
                  testID={`library-table-extract-series-${book.id}`}
                />
              )}
            </HStack>
          </Box>
        ) : null}
        {isVisible("authors") ? (
          <Box
            style={[
              styles.authorsCell,
              { width: columnWidths.authors },
              copiedField === "authors" ? { backgroundColor: COPIED_BACKGROUND_COLOR } : undefined,
            ]}
          >
            <TagInput
              value={authors}
              onChange={setAuthors}
              placeholder="Add author..."
              testID={`library-table-authors-${book.id}`}
              showCopyPaste
              onBlur={handleSave}
              onCopy={() => handleFieldCopy("authors")}
            />
          </Box>
        ) : null}
        {isVisible("seriesName") ? (
          <Box style={[styles.seriesNameCell, { width: columnWidths.seriesName }]}>
            <Input size="sm">
              <InputField
                value={series}
                onChangeText={setSeries}
                onBlur={handleSave}
                onSubmitEditing={handleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave()
                  }
                }}
                testID={`library-table-series-name-${book.id}`}
              />
            </Input>
          </Box>
        ) : null}
        {isVisible("seriesIndex") ? (
          <Box style={[styles.seriesIndexCell, { width: columnWidths.seriesIndex }]}>
            <Input size="sm">
              <InputField
                value={seriesIndex !== null ? String(seriesIndex) : ""}
                onChangeText={(text) => {
                  if (text === "") {
                    setSeriesIndex(null)
                  } else {
                    const num = Number(text)
                    if (!Number.isNaN(num)) {
                      setSeriesIndex(num)
                    }
                  }
                }}
                onBlur={handleSave}
                onSubmitEditing={handleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave()
                  }
                }}
                testID={`library-table-series-index-${book.id}`}
              />
            </Input>
          </Box>
        ) : null}
        {isVisible("tags") ? (
          <Box
            style={[
              styles.tagsCell,
              { width: columnWidths.tags },
              copiedField === "tags" ? { backgroundColor: COPIED_BACKGROUND_COLOR } : undefined,
            ]}
          >
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tag..."
              testID={`library-table-tags-${book.id}`}
              showCopyPaste
              onBlur={handleSave}
              onCopy={() => handleFieldCopy("tags")}
            />
          </Box>
        ) : null}
        {isVisible("publisher") ? (
          <Box style={[styles.publisherCell, { width: columnWidths.publisher }]}>
            <Input size="sm">
              <InputField
                value={publisher}
                onChangeText={setPublisher}
                onBlur={handleSave}
                onSubmitEditing={handleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave()
                  }
                }}
                testID={`library-table-publisher-${book.id}`}
              />
            </Input>
          </Box>
        ) : null}
        {customColumns?.map((col) => {
          if (!isVisible(col.key)) return null
          const value = customColumnValues.get(col.key)
          const handleChange = (newValue: unknown) => {
            setCustomColumnValues((prev) => {
              const next = new Map(prev)
              next.set(col.key, newValue)
              return next
            })
          }
          const handleBlur = () => {
            handleCustomColumnSave(col.key)
          }
          const handleKeyDown = (e: { key: string }) => {
            if (e.key === "Enter") {
              handleCustomColumnSave(col.key)
            }
          }

          let content: React.ReactNode = null
          switch (col.datatype) {
            case "bool":
              content = (
                <Checkbox
                  isChecked={value === true}
                  onChange={(checked: boolean) => {
                    handleChange(checked)
                    handleCustomColumnSave(col.key)
                  }}
                  value={col.key}
                >
                  {value === true ? "Yes" : "No"}
                </Checkbox>
              )
              break
            case "rating":
              content = (
                <RatingGroup
                  max={10}
                  ticks={2}
                  selectedValue={typeof value === "number" ? value : 0}
                  onSelectRating={(rating: number) => {
                    handleChange(rating)
                    handleCustomColumnSave(col.key)
                  }}
                />
              )
              break
            case "int":
            case "float":
              content = (
                <Input size="sm">
                  <InputField
                    value={value !== null && value !== undefined ? String(value) : ""}
                    onChangeText={(text) => {
                      if (text === "") {
                        handleChange(null)
                      } else {
                        const num = col.datatype === "int" ? Number.parseInt(text, 10) : Number.parseFloat(text)
                        if (!Number.isNaN(num)) {
                          handleChange(num)
                        }
                      }
                    }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    testID={`library-table-custom-${col.key}-${book.id}`}
                  />
                </Input>
              )
              break
            case "datetime":
              content = (
                <Input size="sm">
                  <InputField
                    value={value !== null && value !== undefined ? String(value) : ""}
                    onChangeText={(text) => {
                      handleChange(text === "" ? null : text)
                    }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    testID={`library-table-custom-${col.key}-${book.id}`}
                  />
                </Input>
              )
              break
            case "composite":
              content = <Text>{String(value ?? "")}</Text>
              break
            default:
              content = (
                <Input size="sm">
                  <InputField
                    value={value !== null && value !== undefined ? String(value) : ""}
                    onChangeText={(text) => {
                      handleChange(text === "" ? null : text)
                    }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    testID={`library-table-custom-${col.key}-${book.id}`}
                  />
                </Input>
              )
              break
          }

          return (
            <Box key={col.key} style={[styles.customColumnCell]}>
              {content}
            </Box>
          )
        })}
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
    position: "relative",
  },
  resizeHandle: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: -6,
    top: 0,
    width: 12,
    zIndex: 2,
  },
  resizeHandleGrip: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 1,
    height: 18,
    width: 2,
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
    justifyContent: "center",
    paddingHorizontal: 6,
    width: BOOK_COLUMN_WIDTH,
    position: "sticky" as unknown as "relative",
    left: 0,
    zIndex: 10,
  },
  titleCell: {
    paddingHorizontal: 6,
    width: TITLE_COLUMN_WIDTH,
    position: "sticky" as unknown as "relative",
    left: BOOK_COLUMN_WIDTH,
    zIndex: 10,
  },
  authorsCell: {
    paddingHorizontal: 6,
    width: AUTHORS_COLUMN_WIDTH,
  },
  seriesGroupCell: {
    paddingHorizontal: 6,
  },
  seriesNameCell: {
    paddingHorizontal: 6,
    width: SERIES_NAME_COLUMN_WIDTH,
  },
  seriesIndexCell: {
    paddingHorizontal: 6,
    width: SERIES_INDEX_COLUMN_WIDTH,
  },
  tagsCell: {
    paddingHorizontal: 6,
    width: TAGS_COLUMN_WIDTH,
  },
  publisherCell: {
    paddingHorizontal: 6,
    width: PUBLISHER_COLUMN_WIDTH,
  },
  customColumnCell: {
    paddingHorizontal: 6,
    minWidth: 120,
  },
  columnMenuCell: {
    paddingHorizontal: 6,
    width: 40,
  },
  cover: {
    borderRadius: 2,
    height: 48,
    width: 36,
  },
  coverPlaceholder: {
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 2,
    height: 48,
    width: 36,
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
