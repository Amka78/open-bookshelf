import { Box, FlatList, type FlatListProps, ScrollView } from "@/components"
import type { Book } from "@/models/calibre"
import { Fragment, useEffect, useRef } from "react"
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native"

type LibraryBookListProps = {
  bookList: Book[]
  listRef: React.RefObject<React.ElementRef<typeof FlatList> | null>
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

  // TEMP DIAGNOSTIC: Track numColumns changes to identify layout gaps
  const prevNumColumnsRef = useRef(numColumns)
  useEffect(() => {
    if (prevNumColumnsRef.current !== numColumns) {
      console.log(
        JSON.stringify({
          tag: "LibraryBookList-numColumns-change",
          from: prevNumColumnsRef.current,
          to: numColumns,
          bookListLength: bookList.length,
          windowWidth: window.width,
        }),
      )
      prevNumColumnsRef.current = numColumns
    }
  }, [numColumns, bookList.length, window.width])

  const list = (
    <FlatList<Book>
      key={`flatlist-${numColumns}`}
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
      ListHeaderComponent != null ? (
        typeof ListHeaderComponent === "function" ? (
          <ListHeaderComponent />
        ) : (
          ListHeaderComponent
        )
      ) : null

    return (
      <ScrollView
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
          const distanceFromBottom =
            contentSize.height - (contentOffset.y + layoutMeasurement.height)
          // FlatList のデフォルト onEndReachedThreshold (0.5) と同等: 画面高の半分以内で追加読み込み
          if (distanceFromBottom <= layoutMeasurement.height * 0.5) {
            if (!isFocused) return
            onEndReached()
          }
        }}
        scrollEventThrottle={16}
      >
        {header}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <Box width={Math.max(window.width, horizontalContentWidth)}>
            {bookList.map((item, index) => (
              <Fragment key={item.id}>{renderItem?.({ item, index, target: "Cell" })}</Fragment>
            ))}
          </Box>
        </ScrollView>
      </ScrollView>
    )
  }

  return list
}
