import { Box, FlatList, type FlatListProps, ScrollView } from "@/components"
import type { Book } from "@/models/calibre"
import { Fragment, type ReactElement, type ComponentType } from "react"
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
    // FlatList は内部で縦 ScrollView を生成する。
    // position: sticky は最も近いスクロール祖先を参照するため、
    // 横 ScrollView の中に FlatList を入れると sticky が縦 ScrollView を向いてしまい横スクロールで固定されない。
    // 縦 ScrollView > 横 ScrollView > .map() の構造にすることで、
    // sticky の参照先は内側の横 ScrollView になり、縦スクロールも維持される。
    const header =
      ListHeaderComponent != null
        ? typeof ListHeaderComponent === "function"
          ? <ListHeaderComponent />
          : ListHeaderComponent
        : null

    return (
      <ScrollView>
        {header}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <Box width={Math.max(window.width, horizontalContentWidth)}>
            {bookList.map((item, index) => (
              <Fragment key={item.id}>
                {renderItem({ item, index, separators: null as any })}
              </Fragment>
            ))}
          </Box>
        </ScrollView>
      </ScrollView>
    )
  }

  return list
}
