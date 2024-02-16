import { BookDetailMenu, RootContainer, BookImageItem, BookDetailFieldList } from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import { ApppNavigationProp, AppStackParamList } from "@/navigators"
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { FC, useLayoutEffect } from "react"
import { useModal } from "react-native-modalfy"

type BookDetailScreenRouteProp = RouteProp<AppStackParamList, "BookDetail">
export const BookDetailScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookDetailScreenRouteProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const modal = useModal<ModalStackParams>()

  const openViewerHook = useOpenViewer()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: selectedBook.metaData.title,
    })
  }, [navigation, selectedBook.metaData.title])

  return (
    <RootContainer alignItems="center">
      <BookImageItem source={route.params.imageUrl} />
      <BookDetailMenu
        onOpenBook={async () => {
          await openViewerHook.execute(modal)
        }}
        onDownloadBook={() => {}}
        onConvertBook={() => {}}
        onShowEdit={() => {}}
        onDeleteBook={() => {}}
      />
      <BookDetailFieldList
        book={selectedBook}
        fieldMetadataList={selectedLibrary.fieldMetadataList}
        fieldNameList={selectedLibrary.bookDisplayFields}
        onFieldPress={(query) => {
          route.params.onLinkPress(query)
          navigation.goBack()
        }}
        marginTop={"$3"}
      />
    </RootContainer>
  )
})
