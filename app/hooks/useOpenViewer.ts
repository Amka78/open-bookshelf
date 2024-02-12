import { ModalStackParams } from "@/components/Modals/Types"
import { Book } from "@/models/CalibreRootStore"
import { UsableModalProp, useModal } from "react-native-modalfy"
import { useNavigation } from "@react-navigation/native"
import { ApppNavigationProp } from "@/navigators"

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>()

  const onItemPress = async (
    book: Book,
    format: string,
    selectedLibraryId: string,
    modal: UsableModalProp<ModalStackParams>,
  ) => {
    book.metaData.setProp("selectedFormat", format)
    if (format === "PDF") {
      navigation.navigate("PDFViewer", { book: book })
    } else {
      try {
        await book.convert(format, selectedLibraryId, () => {
          navigation.navigate("Viewer", { book: book })
        })
      } catch (e) {
        modal.openModal("ErrorModal", { message: e.message, titleTx: "errors.failedConvert" })
      }
    }
  }
  const execute = async (
    book: Book,
    selectedLibraryId: string,
    modal: UsableModalProp<ModalStackParams>,
  ) => {
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
