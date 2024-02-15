import { BookPage, BookViewer, RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useState, useLayoutEffect } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()
  const [_, setRefresh] = useState()
  const navigation = useNavigation<ApppNavigationProp>()
  useOrientation(() => {
    setRefresh({})
  })
  const selectedBook = calibreRootStore.selectedLibrary?.selectedBook

  useLayoutEffect(() => {
    if (!calibreRootStore.selectedLibrary?.selectedBook) {
      navigation.navigate("Library")
    }
  }, [])
  const cachedPathList = calibreRootStore.selectedLibrary?.readingHistory.find((value) => {
    return (
      value.bookId === selectedBook?.id &&
      value.libraryId === calibreRootStore.selectedLibrary.id &&
      value.format === selectedBook?.metaData.selectedFormat
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

  return selectedBook ? (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={selectedBook.path.length}
    />
  ) : undefined
})
