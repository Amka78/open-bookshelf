import { ModalStackParams } from "@/components/Modals/Types"
import { Book } from "@/models/CalibreRootStore"
import { UsableModalProp } from "react-native-modalfy"
import { useNavigation } from "@react-navigation/native"
import { ApppNavigationProp } from "@/navigators"
import { useStores } from "@/models"

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>()
  const { calibreRootStore } = useStores()

  const onItemPress = async (
    book: Book,
    format: string,
    selectedLibraryId: string,
    modal: UsableModalProp<ModalStackParams>,
  ) => {
    book.metaData.setProp("selectedFormat", format)
    if (format === "PDF") {
      navigation.navigate("PDFViewer")
    } else {
      try {
        await book.convert(format, selectedLibraryId, () => {
          navigation.navigate("Viewer")
        })
      } catch (e) {
        modal.openModal("ErrorModal", { message: e.message, titleTx: "errors.failedConvert" })
      }
    }
  }
  const execute = async (modal: UsableModalProp<ModalStackParams>) => {
    const selectedLibraryId = calibreRootStore.selectedLibrary.id
    const book = calibreRootStore.selectedLibrary.selectedBook
    if (book.metaData.formats.length > 1) {
      modal.openModal("FormatSelectModal", {
        formats: book.metaData.formats,
        onSelectFormat: async (format) => {
          await onItemPress(book, format, selectedLibraryId, modal)
        },
      })
    } else {
      await onItemPress(book, book.metaData.formats[0], selectedLibraryId, modal)
    }
  }
  return {
    execute,
  }
}
