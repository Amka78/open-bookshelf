import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { type Book, ReadingHistoryModel } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { cacheBookFile, cacheBookImages } from "@/utils/bookImageCache"
import { isCalibreHtmlViewerFormat } from "@/utils/calibreHtmlViewer"
import { useNavigation } from "@react-navigation/native"
import type { UsableModalProp } from "react-native-modalfy"

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>()
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const onItemPress = async (
    book: Book,
    format: string,
    selectedLibraryId: string,
    modal: UsableModalProp<ModalStackParams>,
  ) => {
    book.metaData.setProp("selectedFormat", format)
    try {
      const history = calibreRootStore.readingHistories.find((value) => {
        return (
          value.libraryId === selectedLibraryId &&
          value.bookId === book.id &&
          value.format === format
        )
      })

      if (format === "PDF") {
        const cachedPdfPath = await cacheBookFile({
          bookId: book.id,
          format,
          libraryId: selectedLibraryId,
          baseUrl: settingStore.api.baseUrl,
          headers: authenticationStore.getHeader(),
        })

        if (history) {
          if (history.cachedPath.length !== 1 || history.cachedPath[0] !== cachedPdfPath) {
            history.setCachePath([cachedPdfPath])
          }
        } else {
          const historyModel = ReadingHistoryModel.create({
            bookId: book.id,
            currentPage: 0,
            libraryId: selectedLibraryId,
            cachedPath: [cachedPdfPath],
            format: format,
          })
          calibreRootStore.addReadingHistory(historyModel)
        }

        navigation.navigate("PDFViewer")
        return
      }

      console.log("history", history)

      if (history) {
        navigation.navigate("Viewer")
      } else {
        await book.convert(format, selectedLibraryId, async () => {
          const size = book.metaData?.formatSizes.get(format) ?? 0
          const hash = book.hash ?? 0
          const bookImageList = isCalibreHtmlViewerFormat(format)
            ? book.path.slice()
            : await cacheBookImages({
                bookId: book.id,
                format,
                libraryId: calibreRootStore.selectedLibrary.id,
                baseUrl: settingStore.api.baseUrl,
                size,
                hash,
                pathList: book.path.slice(),
                headers: authenticationStore.getHeader(),
              })

          const historyModel = ReadingHistoryModel.create({
            bookId: book.id,
            currentPage: 0,
            libraryId: selectedLibraryId,
            cachedPath: bookImageList,
            format: format,
          })
          calibreRootStore.addReadingHistory(historyModel)
          navigation.navigate("Viewer")
        })
      }
    } catch (e) {
      modal.openModal("ErrorModal", {
        message: e.message,
        titleTx: "errors.failedConvert",
      })
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
