import { BookPage, BookViewer, RenderPageProps } from "@/components"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const selectedBook = calibreRootStore.selectedLibrary.selectedBook

  const renderPage = (props: RenderPageProps) => {
    return (
      <BookPage
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${selectedBook.id}/${
              selectedBook.metaData.selectedFormat
            }/${selectedBook.metaData.size}/${selectedBook.hash}/${
              selectedBook.path[props.page]
            }?library_id=${calibreRootStore.selectedLibrary.id}`,
          ),
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
