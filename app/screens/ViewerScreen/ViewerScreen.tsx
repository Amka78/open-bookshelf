import { BookPage, BookViewer, RenderPageProps } from "@/components"
import { useStores } from "@/models"
import { AppStackParamList } from "@/navigators"
import { RouteProp, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"

type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export const ViewerScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

  const route = useRoute<ViewerScreenRouteProp>()

  const library = route.params.library

  const renderPage = (props: RenderPageProps) => {
    return (
      <BookPage
        source={encodeURI(
          `${settingStore.api.baseUrl}/book-file/${library.id}/${library.metaData.formats[0]}/${
            library.metaData.size
          }/${library.hash}/${library.path[props.page]}?library_id=${
            calibreRootStore.selectedLibraryId
          }`,
        )}
      />
    )
  }

  return (
    <BookViewer
      bookTitle={route.params.library.metaData.title}
      renderPage={renderPage}
      totalPage={library.path.length}
    />
  )
})
