import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import type { UsableModalProp } from "react-native-modalfy"

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>()
  const { calibreRootStore, settingStore } = useStores()

  const onItemPress = async (format: string, selectedLibraryId: string) => {
    const book = calibreRootStore.selectedLibrary.selectedBook
    book.metaData.setProp("selectedFormat", format)
    if (format === "PDF") {
      navigation.navigate("PDFViewer", {
        request: {
          bookId: book.id,
          libraryId: selectedLibraryId,
          format,
        },
      })
      return
    }

    navigation.navigate("Viewer", {
      request: {
        bookId: book.id,
        libraryId: selectedLibraryId,
        format,
      },
    })
  }
  const execute = async (modal: UsableModalProp<ModalStackParams>) => {
    const selectedLibraryId = calibreRootStore.selectedLibrary.id
    const book = calibreRootStore.selectedLibrary.selectedBook
    if (book.metaData.formats.length > 1) {
      const preferredFormat = settingStore.preferredFormat
      if (preferredFormat && book.metaData.formats.includes(preferredFormat)) {
        await onItemPress(preferredFormat, selectedLibraryId)
        return
      }
      modal.openModal("FormatSelectModal", {
        formats: book.metaData.formats,
        onSelectFormat: async (format) => {
          await onItemPress(format, selectedLibraryId)
        },
      })
    } else {
      await onItemPress(book.metaData.formats[0], selectedLibraryId)
    }
  }
  return {
    execute,
  }
}
