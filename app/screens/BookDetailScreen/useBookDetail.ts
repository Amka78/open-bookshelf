import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
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
  const convergenceHook = useConvergence()
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
    if (route.params.onOpenBookAction) {
      await route.params.onOpenBookAction()
      return
    }

    await openViewerHook.execute(modal)
  }

  const handleDownloadBook = async () => {
    if (route.params.onDownloadBookAction) {
      await route.params.onDownloadBookAction()
      return
    }

    await downloadBookHook.execute(modal)
  }

  const handleConvertBook = () => {
    if (convergenceHook.isLarge) {
      modal.openModal("BookConvertModal", {
        imageUrl: route.params.imageUrl,
      })
    } else {
      if (route.params.onNavigateToBookConvert) {
        route.params.onNavigateToBookConvert({
          imageUrl: route.params.imageUrl,
        })
        return
      }

      navigation.navigate("BookConvert", {
        imageUrl: route.params.imageUrl,
      })
    }
  }

  const handleEditBook = () => {
    if (route.params.onNavigateToBookEdit) {
      route.params.onNavigateToBookEdit({
        imageUrl: route.params.imageUrl,
      })
      return
    }

    navigation.navigate("BookEdit", {
      imageUrl: route.params.imageUrl,
    })
  }

  const handleDeleteBook = async () => {
    if (route.params.onDeleteBookAction) {
      await route.params.onDeleteBookAction()
      return
    }

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
