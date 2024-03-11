import { BookDetailFieldList, BookDetailMenu, BookImageItem, RootContainer } from "@/components"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { type FC, useLayoutEffect } from "react"
import { useModal } from "react-native-modalfy"
import { BookDetailScreen as Template } from "./template/BookDetailScreen"
import { useDeleteBook } from "@/hooks/useDeleteBook"

type BookDetailScreenRouteProp = RouteProp<AppStackParamList, "BookDetail">
export const BookDetailScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookDetailScreenRouteProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const modal = useModal<ModalStackParams>()

  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: selectedBook.metaData.title,
    })
  }, [navigation, selectedBook.metaData.title])

  return (
    <Template
      imageUrl={route.params.imageUrl}
      onOpenBook={async () => {
        await openViewerHook.execute(modal)
      }}
      onDownloadBook={() => {}}
      onConvertBook={() => {}}
      onShowEdit={() => {}}
      onDeleteBook={async () => {
        await deleteBookHook.execute(modal)
      }}
      book={selectedBook}
      fieldMetadataList={selectedLibrary.fieldMetadataList}
      fieldNameList={selectedLibrary.bookDisplayFields}
      onFieldPress={(query) => {
        route.params.onLinkPress(query)
        navigation.goBack()
      }}
    />
  )
})
