import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { Book } from "@/models/CalibreRootStore"
import { ReadingHistoryModel } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { Image } from "expo-image"
import type { UsableModalProp } from "react-native-modalfy"

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>()
  const { calibreRootStore, settingStore } = useStores()

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
        const history = calibreRootStore.selectedLibrary.readingHistory.find((value) => {
          return (
            value.libraryId === selectedLibraryId &&
            value.bookId === book.id &&
            value.format === format
          )
        })

        if (history) {
          navigation.navigate("Viewer")
        } else {
          await book.convert(format, selectedLibraryId, async () => {
            const bookImageList = []
            book.path.map(async (value, index) => {
              const imageUrl = encodeURI(
                `${settingStore.api.baseUrl}/book-file/${book.id}/${book.metaData.selectedFormat}/${book.metaData.size}/${book.hash}/${value}?library_id=${calibreRootStore.selectedLibrary.id}`,
              )
              bookImageList.push(imageUrl)
              await Image.prefetch(imageUrl)
            })

            const historyModel = ReadingHistoryModel.create({
              bookId: book.id,
              currentPage: 0,
              libraryId: selectedLibraryId,
              cachedPath: bookImageList,
              format: format,
            })
            calibreRootStore.selectedLibrary.addReadingHistory(historyModel)
            navigation.navigate("Viewer")
          })
        }
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
