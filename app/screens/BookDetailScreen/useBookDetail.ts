import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useLayoutEffect } from "react"
import { useModal } from "react-native-modalfy"
import { useDeleteBook } from "../../hooks/useDeleteBook"
import { useDownloadBook } from "../../hooks/useDownloadBook"
import { useOpenViewer } from "../../hooks/useOpenViewer"

type BookDetailScreenRouteProp = RouteProp<AppStackParamList, "BookDetail">

export function useBookDetail() {
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

  const handleOpenBook = async () => {
    await openViewerHook.execute(modal)
  }

  const handleDownloadBook = async () => {
    await downloadBookHook.execute(modal)
  }

  const handleConvertBook = () => {}

  const handleEditBook = () => {
    navigation.navigate("BookEdit", {
      imageUrl: route.params.imageUrl,
    })
  }

  const handleDeleteBook = async () => {
    await deleteBookHook.execute(modal)
  }

  const handleFieldPress = (query: string) => {
    route.params.onLinkPress(query)
    navigation.goBack()
  }

  return {
    selectedLibrary,
    selectedBook,
    imageUrl: route.params.imageUrl,
    handleOpenBook,
    handleDownloadBook,
    handleConvertBook,
    handleEditBook,
    handleDeleteBook,
    handleFieldPress,
  }
}
