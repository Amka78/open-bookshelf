import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useEffect, useLayoutEffect, useState } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()
  const [_, setRefresh] = useState<object>({})
  const navigation = useNavigation<ApppNavigationProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary

  useOrientation(() => {
    setRefresh({})
  })
  const selectedBook = selectedLibrary?.selectedBook

  useLayoutEffect(() => {
    logger.debug("ViewerScreen selectedBook", selectedBook)
    if (!selectedBook) {
      navigation.navigate("Library")
    }
  }, [selectedBook, navigation])

  if (!selectedLibrary || !selectedBook) {
    return undefined
  }

  const selectedFormat = selectedBook.metaData.selectedFormat
  const histories = calibreRootStore.readingHistories.filter((value) => {
    return value.bookId === selectedBook.id && value.libraryId === selectedLibrary.id
  })
  const history =
    histories.find((value) => {
      return (
        selectedFormat !== null && selectedFormat !== undefined && value.format === selectedFormat
      )
    }) ?? histories[histories.length - 1]

  useEffect(() => {
    if (!selectedFormat && history?.format) {
      selectedBook.metaData.setProp("selectedFormat", history.format)
    }
  }, [history?.format, selectedBook, selectedFormat])

  const cachedPathList = history?.cachedPath
  const totalPage = cachedPathList?.length ?? selectedBook.path.length

  const renderPage = (props: RenderPageProps) => {
    const pagePath = cachedPathList?.[props.page] ?? selectedBook.path[props.page]
    const isRemotePath = isRemoteBookImagePath(pagePath)
    return (
      <BookPage
        source={{
          uri: pagePath,
          headers: isRemotePath ? authenticationStore.getHeader() : undefined,
        }}
      />
    )
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPage}
      onPageChange={(page) => {
        if (history?.currentPage !== page) {
          history?.setCurrentPage(page)
        }
      }}
    />
  )
})
