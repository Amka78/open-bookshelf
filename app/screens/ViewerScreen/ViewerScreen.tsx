import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useLayoutEffect } from "react"
import type { ModalStackParams } from "@/components/Modals/Types"

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
    totalPage,
    onPageChange,
    onLastPage,
  } = viewerHook

  useOrientation(() => {
    // Trigger refresh on orientation change
  })

  useLayoutEffect(() => {
    if (!selectedBook) {
      navigation.navigate("Library")
    }
  }, [selectedBook, navigation])

  if (!selectedLibrary || !selectedBook) {
    return undefined
  }

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

  if (!viewerReady) {
    return undefined
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPage}
      initialPage={initialPage}
      onPageChange={onPageChange}
      onLastPage={onLastPage}
    />
  )
})
