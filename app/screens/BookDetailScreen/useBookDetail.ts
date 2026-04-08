import { useConvergence } from "@/hooks/useConvergence"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import { useLayoutEffect } from "react"
import { Alert, Linking, Share } from "react-native"
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

  const handleSendByEmail = () => {
    const book = calibreRootStore.selectedLibrary?.selectedBook
    const library = calibreRootStore.selectedLibrary
    if (!book || !library) return

    const formats: string[] = (book.metaData?.formats as string[] | undefined) ?? []
    if (formats.length === 0) {
      Alert.alert(translate("emailDelivery.noFormats"))
      return
    }

    const formatOptions = formats.map((fmt: string) => ({
      text: fmt,
      onPress: () => {
        Alert.alert(
          translate("emailDelivery.confirmTitle"),
          translate("emailDelivery.confirmMessage", {
            format: fmt,
            title: book.metaData?.title ?? "",
          }),
          [
            { text: translate("common.cancel"), style: "cancel" as const },
            {
              text: translate("emailDelivery.send"),
              onPress: async () => {
                const result = await api.sendBookByEmail(library.id, book.id, fmt)
                if (result.kind === "ok") {
                  Alert.alert(
                    translate("emailDelivery.sentTitle"),
                    translate("emailDelivery.sentMessage"),
                  )
                } else {
                  Alert.alert(translate("common.error"), translate("emailDelivery.errorMessage"))
                }
              },
            },
          ],
        )
      },
    }))
    formatOptions.push({ text: translate("common.cancel"), onPress: () => {} })
    Alert.alert(
      translate("emailDelivery.selectFormat"),
      translate("emailDelivery.selectFormatMessage"),
      formatOptions,
    )
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

  const handleDownloadFormat = (format: string) => {
    const url = api.getBookDownloadUrl(format, selectedBook.id, selectedLibrary.id)
    Linking.openURL(url)
  }

  const handleDeleteFormat = async (format: string) => {
    try {
      const result = await api.deleteBookFormat(selectedLibrary.id, selectedBook.id, format)
      if (result.kind === "ok") {
        Alert.alert(translate("common.ok"), translate("bookFormatList.deleteSuccess"))
      }
    } catch (error) {
      console.error("deleteFormat error", error)
    }
  }

  const handleUploadFormat = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" })
      if (result.canceled || result.assets.length === 0) return

      const asset = result.assets[0]
      const ext = asset.name.split(".").pop()
      const format = ext ? ext.toUpperCase() : ""
      if (!format) return

      const filePayload = asset.file ?? asset.uri
      if (!filePayload) return

      const uploadResult = await api.uploadBookFormat(
        selectedLibrary.id,
        selectedBook.id,
        format,
        asset.name,
        filePayload,
      )
      if (uploadResult.kind === "ok") {
        Alert.alert(translate("common.ok"), translate("bookFormatList.uploadSuccess"))
      }
    } catch (error) {
      console.error("uploadFormat error", error)
    }
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
    handleSendByEmail,
    handleFieldPress,
    readStatus,
    handleSetStatus,
    handleDownloadFormat,
    handleDeleteFormat,
    handleUploadFormat,
  }
}
