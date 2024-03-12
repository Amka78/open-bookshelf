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
import { useDownloadBook } from "@/hooks/useDownloadBook"

type BookDetailScreenRouteProp = RouteProp<AppStackParamList, "BookDetail">
export const BookDetailScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookDetailScreenRouteProp>()
  const modal = useModal<ModalStackParams>()
  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  const downloadBookHook = useDownloadBook()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

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
      onDownloadBook={async () => {
        await downloadBookHook.execute(modal)
      }}
      onConvertBook={() => {}}
      onEditBook={() => {
        navigation.navigate("BookEdit", {
          imageUrl: route.params.imageUrl,
        })
      }}
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
