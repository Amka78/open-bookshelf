import { BookDetailMenu, RootContainer, BookImageItem, MetadataFieldList } from "@/components"
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
  const modal = useModal<ModalStackParams>()

  const openViewerHook = useOpenViewer()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.book.metaData.title,
    })
  }, [navigation, route.params.book.metaData.title])

  return (
    <RootContainer alignItems="center">
      <BookImageItem source={route.params.imageUrl} />
      <BookDetailMenu
        onOpenBook={async () => {
          await openViewerHook.execute(route.params.book, selectedLibrary.id, modal)
        }}
        onDownloadBook={() => {}}
        onConvertBook={() => {}}
        onShowEdit={() => {}}
        onDeleteBook={() => {}}
      />
      <MetadataFieldList
        book={route.params.book}
        fieldMetadataList={route.params.fieldMetadataList}
        fieldNameList={route.params.fieldNameList}
        onFieldPress={(query) => {
          route.params.onLinkPress(query)
          navigation.goBack()
        }}
        marginTop={"$3"}
      />
    </RootContainer>
  )
})
