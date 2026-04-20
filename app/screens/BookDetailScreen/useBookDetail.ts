import { useConvergence } from "@/hooks/useConvergence"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { type MessageKey, translate } from "@/i18n"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import { useLayoutEffect } from "react"
import { Linking, Share } from "react-native"
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
  const ocrImageUrl = encodeURI(api.getBookThumbnailUrl(selectedBook.id, selectedLibrary.id, "1200x1600"))

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

  const handleRunCoverOcr = () => {
    if (convergenceHook.isLarge) {
      modal.openModal("BookOcrReviewModal", {
        imageUrl: ocrImageUrl,
      })
      return
    }

    if (route.params.onNavigateToBookOcr) {
      route.params.onNavigateToBookOcr({
        imageUrl: ocrImageUrl,
      })
      return
    }

    navigation.navigate("BookOcrReview", {
      imageUrl: ocrImageUrl,
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

    const openMessageModal = (titleTx: MessageKey, messageTx: MessageKey) => {
      modal.openModal("ErrorModal", {
        titleTx,
        messageTx,
      })
    }

    const openSendConfirmModal = (format: string) => {
      modal.openModal("ConfirmModal", {
        titleTx: "emailDelivery.confirmTitle",
        message: translate("emailDelivery.confirmMessage", {
          format,
          title: book.metaData?.title ?? "",
        }),
        okTx: "emailDelivery.send",
        onOKPress: async () => {
          const result = await api.sendBookByEmail(library.id, book.id, format)
          if (result.kind === "ok") {
            openMessageModal("emailDelivery.sentTitle", "emailDelivery.sentMessage")
          } else {
            openMessageModal("common.error", "emailDelivery.errorMessage")
          }
        },
      })
    }

    const formats: string[] = (book.metaData?.formats as string[] | undefined) ?? []
    if (formats.length === 0) {
      openMessageModal("common.error", "emailDelivery.noFormats")
      return
    }

    if (formats.length === 1) {
      openSendConfirmModal(formats[0])
      return
    }

    modal.openModal("FormatSelectModal", {
      titleTx: "emailDelivery.selectFormat",
      messageTx: "emailDelivery.selectFormatMessage",
      formats,
      onSelectFormat: openSendConfirmModal,
    })
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
      const result = await api.editBook(selectedLibrary.id, selectedBook.id, {
        changes: { removed_formats: [format.toUpperCase()] } as never,
        loaded_book_ids: [selectedBook.id],
      })
      if (result.kind === "ok") {
        // Update local formats list
        const currentFormats = [...(selectedBook.metaData?.formats ?? [])]
        const upper = format.toUpperCase()
        const remaining = currentFormats.filter((f) => f.toUpperCase() !== upper)
        selectedBook.metaData?.setProp("formats", remaining as never)
        modal.openModal("ErrorModal", {
          titleTx: "common.ok",
          messageTx: "bookFormatList.deleteSuccess",
        })
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

      const { fileToDataUrl } = await import("@/utils/fileToDataUrl")
      const dataUrl = await fileToDataUrl(filePayload)

      const uploadResult = await api.editBook(selectedLibrary.id, selectedBook.id, {
        changes: {
          added_formats: [
            {
              ext: format,
              data_url: dataUrl,
              name: asset.name,
              size: asset.size ?? 0,
              type: asset.mimeType ?? "application/octet-stream",
            },
          ],
        } as never,
        loaded_book_ids: [selectedBook.id],
      })
      if (uploadResult.kind === "ok") {
        // Update local formats list
        const currentFormats = [...(selectedBook.metaData?.formats ?? [])]
        if (!currentFormats.map((f) => f.toUpperCase()).includes(format)) {
          currentFormats.push(format)
          selectedBook.metaData?.setProp("formats", currentFormats as never)
        }
        modal.openModal("ErrorModal", {
          titleTx: "common.ok",
          messageTx: "bookFormatList.uploadSuccess",
        })
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
    handleRunCoverOcr,
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
