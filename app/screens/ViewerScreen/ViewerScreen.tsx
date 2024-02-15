import { BookPage, BookViewer, RenderPageProps } from "@/components"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()

  const selectedBook = calibreRootStore.selectedLibrary.selectedBook

  const cachedPathList = calibreRootStore.selectedLibrary.readingHistory.find((value) => {
    return (
      value.bookId === selectedBook.id &&
      value.libraryId === calibreRootStore.selectedLibrary.id &&
      value.format === selectedBook.metaData.selectedFormat
    )
  })?.cachedPath

  const renderPage = (props: RenderPageProps) => {
    return (
      <BookPage
        source={{
          uri: cachedPathList[props.page],
          headers: authenticationStore.getHeader(),
        }}
      />
    )
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={selectedBook.path.length}
    />
  )
})
