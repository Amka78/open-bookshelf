import { BookPage, BookViewer, LabeledSpinner, TextBookViewer, type RenderPageProps } from "@/components"
import { BookHtmlPage } from "@/components/BookHtmlPage"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useCallback, useEffect, useLayoutEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useViewerPreparation } from "./useViewerPreparation"

const ViewerScreenContent: FC = observer(() => {
  const { authenticationStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const viewerHook = useViewer()
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
    ? isCalibreHtmlViewerFormat(selectedBook.metaData.selectedFormat)
    : false
  const sourcePathList = useMemo(
    (): string[] =>
      selectedBook
        ? selectedBook.path.length > 0
          ? selectedBook.path
          : isHtmlViewerFormat
            ? selectedBook.path
            : cachedPathList ?? selectedBook.path
        : [],
    [selectedBook, isHtmlViewerFormat, cachedPathList],
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
    logger.debug("ViewerScreen: Rendering viewer with", {
      bookId: selectedBook.id,
      format: selectedBook.metaData.selectedFormat,
      initialPage,
      totalPages,
    })
  }, [viewerReady, selectedBook, initialPage, totalPages])

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
            format={selectedBook.metaData.selectedFormat ?? "AZW3"}
            hash={selectedBook.hash ?? 0}
            headers={authenticationStore.getHeader(sourcePagePath)}
            libraryId={selectedLibrary.id}
            onPress={renderProps.onPress}
            onLongPress={renderProps.onLongPress}
            pagePath={sourcePagePath}
            size={selectedBook.metaData.formatSizes.get(selectedBook.metaData.selectedFormat) ?? 0}
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

  if (!selectedLibrary || !selectedBook) {
    return null
  }

  if (!viewerReady) {
    return null
  }

  if (usesTextBookViewer) {
    return <TextBookViewer viewerHook={viewerHook} getAuthHeader={authenticationStore.getHeader} />
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPages}
      initialPage={initialPage}
      onPageChange={onPageChange}
      onLastPage={onLastPage}
    />
  )
})

export const ViewerScreen: FC = observer(() => {
  const { messageTx, phase } = useViewerPreparation("Viewer")

  if (phase === "preparing") {
    return (
      <LabeledSpinner
        labelDirection="vertical"
        labelTx={messageTx}
        containerStyle={styles.loadingRoot}
      />
    )
  }

  if (phase === "error") {
    return null
  }

  return <ViewerScreenContent />
})

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
  },
})
