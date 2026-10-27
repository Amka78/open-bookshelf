import {
  BookPage,
  BookViewer,
  LabeledSpinner,
  TextBookViewer,
  type RenderPageProps,
} from "@/components"
import { BookHtmlPage } from "@/components/BookHtmlPage"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useSeriesNavigation } from "@/screens/ViewerScreen/useSeriesNavigation"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { Image } from "expo-image"
import { observer } from "mobx-react-lite"
import React, { type FC, useCallback, useEffect, useLayoutEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useViewerPreparation } from "./useViewerPreparation"

const ViewerScreenContent: FC = observer(() => {
  const { authenticationStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const viewerHook = useViewer()
  const { seriesInfo, onPreviousBook, onNextBook } = useSeriesNavigation()
  const {
    selectedLibrary,
    selectedBook,
    initialPage,
    viewerReady,
    cachedPathList,
    onPageChange,
    onLastPage,
  } = viewerHook

  // Derive source list before hooks so all hooks are called unconditionally.
  const isHtmlViewerFormat = selectedBook
    ? isCalibreHtmlViewerFormat(selectedBook.metaData!.selectedFormat)
    : false
  // selectedBook.path is an MST observable array whose object reference stays
  // stable while items are appended. Reading only `selectedBook` /
  // `cachedPathList` as deps therefore freezes the memo at the first render —
  // for AZW3 books whose spine paths arrive asynchronously after mount, the
  // list would stay empty and usesTextBookViewer would stay false forever,
  // routing the book to BookHtmlPage (blank/black). Depend on the path count
  // and return a plain snapshot so downstream memos see a fresh reference.
  const selectedBookPathLength = selectedBook?.path.length ?? 0
  const sourcePathList = useMemo(
    (): string[] =>
      selectedBook
        ? selectedBookPathLength > 0
          ? selectedBook.path.slice()
          : isHtmlViewerFormat
            ? selectedBook.path.slice()
            : cachedPathList ?? selectedBook.path.slice()
        : [],
    [selectedBook, selectedBookPathLength, isHtmlViewerFormat, cachedPathList],
  )
  const totalPages = sourcePathList.length
  const usesTextBookViewer = useMemo(
    () => sourcePathList.some((path) => isCalibreSerializedHtmlPath(path)),
    [sourcePathList],
  )

  useLayoutEffect(() => {
    if (!selectedBook) {
      navigation.navigate("Library")
    }
  }, [selectedBook, navigation])

  useEffect(() => {
    if (!viewerReady || !selectedBook) return
    // TEMP DIAGNOSTIC: AZW3 真っ黒画面の原因を特定するため、ビューア切り替えの判定値をログに出す。確認後に削除予定。
    logger.debug("[tb-diag] ViewerScreen: sourcePathList and usesTextBookViewer", {
      sourcePathListLength: sourcePathList.length,
      usesTextBookViewer,
      pathSample: sourcePathList.slice(0, 3),
      selectedBookPathLength: selectedBook.path.length,
      isHtmlViewerFormat,
    })
    logger.debug("ViewerScreen: Rendering viewer with", {
      bookId: selectedBook.id,
      format: selectedBook.metaData!.selectedFormat,
      initialPage,
      totalPages,
    })
  }, [
    viewerReady,
    selectedBook,
    initialPage,
    totalPages,
    sourcePathList,
    usesTextBookViewer,
    isHtmlViewerFormat,
  ])

  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      if (!selectedBook || !selectedLibrary) return null
      const sourcePagePath = sourcePathList[renderProps.page]

      if (isCalibreSerializedHtmlPath(sourcePagePath)) {
        logger.debug("Page is a Calibre serialized HTML, rendering with BookHtmlPage", {
          page: renderProps.page,
          sourcePagePath,
        })
        return (
          <BookHtmlPage
            availableWidth={renderProps.availableWidth}
            availableHeight={renderProps.availableHeight}
            pageType={renderProps.pageType}
            bookId={selectedBook.id}
            format={selectedBook.metaData!.selectedFormat ?? "AZW3"}
            hash={selectedBook.hash ?? 0}
            headers={authenticationStore.getHeader(sourcePagePath)}
            libraryId={selectedLibrary.id}
            onPress={renderProps.onPress}
            onLongPress={renderProps.onLongPress}
            pagePath={sourcePagePath}
            size={
              selectedBook.metaData!.formatSizes.get(selectedBook.metaData!.selectedFormat ?? "") ??
              0
            }
            annotations={renderProps.annotations}
            onTextSelect={renderProps.onTextSelect}
          />
        )
      }

      const pagePath = cachedPathList?.[renderProps.page] ?? sourcePagePath
      const isRemotePath = isRemoteBookImagePath(pagePath)
      logger.debug("Page is an image, rendering with BookPage", {
        page: renderProps.page,
        pagePath,
        isRemotePath,
      })

      return (
        <BookPage
          availableWidth={renderProps.availableWidth}
          availableHeight={renderProps.availableHeight}
          source={{
            uri: pagePath,
            headers: isRemotePath ? authenticationStore.getHeader(pagePath) : undefined,
          }}
        />
      )
    },
    [sourcePathList, cachedPathList, selectedBook, selectedLibrary, authenticationStore],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      onPageChange?.(page)
      const nextPages = [page + 1, page + 2, page + 3]
        .filter((p) => p < sourcePathList.length)
        .map((p) => cachedPathList?.[p] ?? sourcePathList[p])
      if (nextPages.length > 0) {
        Image.prefetch(nextPages)
      }
    },
    [onPageChange, sourcePathList, cachedPathList],
  )

  if (!selectedLibrary || !selectedBook) {
    return null
  }

  if (!viewerReady) {
    return null
  }

  if (usesTextBookViewer) {
    return (
      <TextBookViewer
        viewerHook={viewerHook}
        getAuthHeader={authenticationStore.getHeader}
        seriesInfo={seriesInfo}
        onPreviousSeriesBook={onPreviousBook}
        onNextSeriesBook={onNextBook}
      />
    )
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData!.title ?? ""}
      renderPage={renderPage}
      totalPage={totalPages}
      initialPage={initialPage}
      onPageChange={handlePageChange}
      onLastPage={onLastPage}
      seriesInfo={seriesInfo}
      onPreviousSeriesBook={onPreviousBook}
      onNextSeriesBook={onNextBook}
    />
  )
})

export const ViewerScreen: FC = observer(() => {
  const { messageTx, phase } = useViewerPreparation("Viewer")

  if (phase === "preparing") {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <LabeledSpinner
          labelDirection="vertical"
          labelTx={messageTx}
          containerStyle={styles.loadingRoot}
        />
      </SafeAreaView>
    )
  }

  if (phase === "error") {
    return null
  }

  return (
    <SafeAreaView style={styles.loadingRoot}>
      <ViewerScreenContent />
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
  },
})
