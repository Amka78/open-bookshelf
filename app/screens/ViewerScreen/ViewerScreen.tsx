import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import { BookHtmlPage } from "@/components/BookHtmlPage"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useEffect, useLayoutEffect } from "react"

export const ViewerScreen: FC = observer(() => {
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
  const sourcePathList = selectedBook
    ? selectedBook.path.length > 0
      ? selectedBook.path
      : isHtmlViewerFormat
        ? selectedBook.path
        : cachedPathList ?? selectedBook.path
    : []
  const totalPages = sourcePathList.length

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

  if (!selectedLibrary || !selectedBook) {
    return null
  }

  const renderPage = (props: RenderPageProps) => {
      const sourcePagePath = sourcePathList[props.page]

      if (isCalibreSerializedHtmlPath(sourcePagePath)) {
        logger.debug("Page is a Calibre serialized HTML, rendering with BookHtmlPage", {
          page: props.page,
          sourcePagePath,
        })
        return (
          <BookHtmlPage
            availableWidth={props.availableWidth}
            availableHeight={props.availableHeight}
            pageType={props.pageType}
            bookId={selectedBook.id}
            format={selectedBook.metaData.selectedFormat ?? "AZW3"}
            hash={selectedBook.hash ?? 0}
            headers={authenticationStore.getHeader(sourcePagePath)}
            libraryId={selectedLibrary.id}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            pagePath={sourcePagePath}
            size={selectedBook.metaData.formatSizes.get(selectedBook.metaData.selectedFormat) ?? 0}
            annotations={props.annotations}
            onTextSelect={props.onTextSelect}
          />
        )
      }

      const pagePath = cachedPathList?.[props.page] ?? sourcePagePath
      const isRemotePath = isRemoteBookImagePath(pagePath)
      logger.debug("Page is an image, rendering with BookPage", {
        page: props.page,
        pagePath,
        isRemotePath,
      })

      return (
        <BookPage
          availableWidth={props.availableWidth}
          availableHeight={props.availableHeight}
          source={{
            uri: pagePath,
            headers: isRemotePath ? authenticationStore.getHeader(pagePath) : undefined,
          }}
        />
      )
    }

  if (!viewerReady) {
    return null
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
