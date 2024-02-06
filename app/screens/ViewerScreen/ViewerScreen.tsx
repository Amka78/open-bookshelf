import { BookPage, BookViewer, RenderPageProps } from "@/components"
import { useStores } from "@/models"
import { AppStackParamList } from "@/navigators"
import { RouteProp, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const route = useRoute<ViewerScreenRouteProp>()

  const book = route.params.book

  let header

  if (authenticationStore.isAuthenticated) {
    header = { Authorization: `Basic ${authenticationStore.token}` }
  }

  const renderPage = (props: RenderPageProps) => {
    return (
      <BookPage
        source={{
          uri: encodeURI(
            `${settingStore.api.baseUrl}/book-file/${book.id}/${book.metaData.selectedFormat}/${
              book.metaData.size
            }/${book.hash}/${book.path[props.page]}?library_id=${
              calibreRootStore.selectedLibraryId
            }`,
          ),
          headers: header,
        }}
      />
    )
  }

  return (
    <BookViewer
      bookTitle={route.params.book.metaData.title}
      renderPage={renderPage}
      totalPage={book.path.length}
    />
  )
})
