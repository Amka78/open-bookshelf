import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { cacheBookImages, isRemoteBookImagePath } from "@/utils/bookImageCache"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useEffect, useState, useLayoutEffect } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
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
  const history = calibreRootStore.selectedLibrary?.readingHistory.find((value) => {
    return (
      value.bookId === selectedBook?.id &&
      value.libraryId === calibreRootStore.selectedLibrary.id &&
      value.format === selectedBook?.metaData.selectedFormat
    )
  })
  const cachedPathList = history?.cachedPath
  const hasRemotePath = Boolean(cachedPathList?.some((value) => isRemoteBookImagePath(value)))

  useEffect(() => {
    if (!selectedBook || !history || !cachedPathList?.length || !hasRemotePath) {
      return
    }

    const selectedFormat = selectedBook.metaData?.selectedFormat
    const size = selectedBook.metaData?.size
    const hash = selectedBook.hash
    if (!selectedFormat || size === null || size === undefined || hash === null || hash === undefined) {
      return
    }

    let cancelled = false

    const loadCache = async () => {
      const cachedList = await cacheBookImages({
        bookId: selectedBook.id,
        format: selectedFormat,
        libraryId: calibreRootStore.selectedLibrary.id,
        baseUrl: settingStore.api.baseUrl,
        size,
        hash,
        pathList: selectedBook.path,
        headers: authenticationStore.getHeader(),
      })

      if (!cancelled) {
        history.setCachePath(cachedList)
      }
    }

    loadCache()

    return () => {
      cancelled = true
    }
  }, [
    authenticationStore,
    cachedPathList?.length,
    calibreRootStore.selectedLibrary.id,
    hasRemotePath,
    history,
    selectedBook,
    settingStore.api.baseUrl,
  ])

  const renderPage = (props: RenderPageProps) => {
    return (
      <BookPage
        source={{
          uri: cachedPathList?.[props.page],
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
