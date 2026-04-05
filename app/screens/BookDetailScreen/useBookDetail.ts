import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useLayoutEffect } from "react"
import { Share } from "react-native"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useDeleteBook } from "../../hooks/useDeleteBook"
import { useDownloadBook } from "../../hooks/useDownloadBook"
import { useOpenViewer } from "../../hooks/useOpenViewer"

type BookDetailScreenRouteProp = RouteProp<AppStackParamList, "BookDetail">
type ReadStatusValue = "want-to-read" | "reading" | "finished"

export function useBookDetail() {
  const { calibreRootStore, settingStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookDetailScreenRouteProp>()
  const modal = useElectrobunModal()
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

  const handleShareLink = async () => {
    const formats = selectedBook.metaData.formats
    if (!formats || formats.length === 0) return

    const shareForFormat = async (format: string) => {
      const url = api.getBookDownloadUrl(format, selectedBook.id, selectedLibrary.id)
      await Share.share({ url, message: `${selectedBook.metaData.title} - ${url}` })
    }

    if (formats.length === 1) {
      await shareForFormat(formats[0])
    } else {
      modal.openModal("FormatSelectModal", {
        formats: formats.slice(),
        onSelectFormat: async (format) => {
          await shareForFormat(format)
        },
      })
    }
  }

  const handleFieldPress = (query: string) => {
    route.params.onLinkPress(query)
    navigation.goBack()
  }

  const readStatus = settingStore.getReadStatus(selectedLibrary.id, selectedBook.id) as
    | ReadStatusValue
    | undefined

  const handleSetStatus = (status: ReadStatusValue | null) => {
    settingStore.setReadStatus(selectedLibrary.id, selectedBook.id, status)
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
    handleShareLink,
    handleFieldPress,
    readStatus,
    handleSetStatus,
  }
}
