import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useLayoutEffect, useState } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()
  const [_, setRefresh] = useState<object>({})
  const navigation = useNavigation<ApppNavigationProp>()

  useOrientation(() => {
    setRefresh({})
  })
  const selectedBook = calibreRootStore.selectedLibrary?.selectedBook

  useLayoutEffect(() => {
    logger.debug("ViewerScreen selectedBook", selectedBook)
    if (!selectedBook) {
      navigation.navigate("Library")
    }
  }, [selectedBook, navigation])
  const history = calibreRootStore.readingHistories.find((value) => {
    return (
      value.bookId === selectedBook?.id &&
      value.libraryId === calibreRootStore.selectedLibrary.id &&
      value.format === selectedBook?.metaData.selectedFormat
    )
  })
  const cachedPathList = history?.cachedPath

  const renderPage = (props: RenderPageProps) => {
    const pagePath = cachedPathList?.[props.page]
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

  return selectedBook ? (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={selectedBook.path.length}
      onPageChange={(page) => {
        if (history?.currentPage !== page) {
          history?.setCurrentPage(page)
        }
      }}
    />
  ) : undefined
})
