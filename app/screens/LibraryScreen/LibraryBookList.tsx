import { Box, FlatList, type FlatListProps, ScrollView } from "@/components"
import type { Book } from "@/models/calibre"
import type React from "react"
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native"

type LibraryBookListProps = {
  bookList: Book[]
  listRef: React.RefObject<React.ElementRef<typeof FlatList>>
  renderItem: FlatListProps<Book>["renderItem"]
  numColumns: number
  isFocused: boolean
  handleListScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  restoreScrollOffset: () => void
  onEndReached: () => Promise<void>
  onRefresh: () => Promise<void>
  preparing: boolean
  wrapInHorizontalScroll?: boolean
  horizontalContentWidth?: number
  // FlatList の ListHeaderComponent は ReactNode を受け付けない（ReactElement か ComponentType）。
  ListHeaderComponent?: React.ReactElement | React.ComponentType<unknown>
}

export function LibraryBookList({
  bookList,
  listRef,
  renderItem,
  numColumns,
  isFocused,
  handleListScroll,
  restoreScrollOffset,
  onEndReached,
  onRefresh,
  preparing,
  wrapInHorizontalScroll = false,
  horizontalContentWidth,
  ListHeaderComponent,
}: LibraryBookListProps) {
  const window = useWindowDimensions()

  const list = (
    <FlatList<Book>
      ref={listRef}
      data={bookList}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.id}`}
      numColumns={numColumns}
      ListHeaderComponent={ListHeaderComponent}
      onContentSizeChange={() => {
        restoreScrollOffset()
      }}
      onRefresh={onRefresh}
      onScroll={handleListScroll}
      scrollEventThrottle={16}
      onEndReached={async () => {
        if (!isFocused) return
        await onEndReached()
      }}
      preparing={preparing}
    />
  )

  if (wrapInHorizontalScroll && horizontalContentWidth) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <Box width={Math.max(window.width, horizontalContentWidth)}>{list}</Box>
      </ScrollView>
    )
  }

  return list
}
