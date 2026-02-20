import type { ModalStackParams } from "@/components/Modals/Types";
import { useStores } from "@/models";
import { ReadingHistoryModel, type Book } from "@/models/calibre";
import type { ApppNavigationProp } from "@/navigators";
import { cacheBookImages } from "@/utils/bookImageCache";
import { useNavigation } from "@react-navigation/native";
import type { UsableModalProp } from "react-native-modalfy";

export function useOpenViewer() {
  const navigation = useNavigation<ApppNavigationProp>();
  const { authenticationStore, calibreRootStore, settingStore } = useStores();

  type ViewerRoute = "Viewer" | "PDFViewer";
  type ExecuteOptions = {
    navigate?: boolean;
    onComplete?: (info: {
      route: ViewerRoute;
      format: string;
      bookId: number;
      libraryId: string;
    }) => void;
  };

  const onItemPress = async (
    book: Book,
    format: string,
    selectedLibraryId: string,
    modal: UsableModalProp<ModalStackParams>,
    options: ExecuteOptions,
  ) => {
    const shouldNavigate = options.navigate !== false;
    book.metaData.setProp("selectedFormat", format);
    if (format === "PDF") {
      options.onComplete?.({
        route: "PDFViewer",
        format,
        bookId: book.id,
        libraryId: selectedLibraryId,
      });
      if (shouldNavigate) {
        navigation.navigate("PDFViewer");
      }
    } else {
      try {
        const history = calibreRootStore.readingHistories.find((value) => {
          return (
            value.libraryId === selectedLibraryId &&
            value.bookId === book.id &&
            value.format === format
          );
        });
        console.log("history", history);

        if (history) {
          options.onComplete?.({
            route: "Viewer",
            format,
            bookId: book.id,
            libraryId: selectedLibraryId,
          });
          if (shouldNavigate) {
            navigation.navigate("Viewer");
          }
        } else {
          await book.convert(format, selectedLibraryId, async () => {
            const size = book.metaData?.size ?? 0;
            const hash = book.hash ?? 0;
            const bookImageList = await cacheBookImages({
              bookId: book.id,
              format,
              libraryId: calibreRootStore.selectedLibrary.id,
              baseUrl: settingStore.api.baseUrl,
              size,
              hash,
              pathList: book.path.slice(),
              headers: authenticationStore.getHeader(),
            });

            const historyModel = ReadingHistoryModel.create({
              bookId: book.id,
              currentPage: 0,
              libraryId: selectedLibraryId,
              cachedPath: bookImageList,
              format: format,
            });
            calibreRootStore.addReadingHistory(historyModel);
            options.onComplete?.({
              route: "Viewer",
              format,
              bookId: book.id,
              libraryId: selectedLibraryId,
            });
            if (shouldNavigate) {
              navigation.navigate("Viewer");
            }
          });
        }
      } catch (e) {
        modal.openModal("ErrorModal", {
          message: e.message,
          titleTx: "errors.failedConvert",
        });
      }
    }
  };
  const execute = async (
    modal: UsableModalProp<ModalStackParams>,
    options: ExecuteOptions = {},
  ) => {
    const selectedLibraryId = calibreRootStore.selectedLibrary.id;
    const book = calibreRootStore.selectedLibrary.selectedBook;
    if (book.metaData.formats.length > 1) {
      modal.openModal("FormatSelectModal", {
        formats: book.metaData.formats,
        onSelectFormat: async (format) => {
          await onItemPress(book, format, selectedLibraryId, modal, options);
        },
      });
    } else {
      await onItemPress(
        book,
        book.metaData.formats[0],
        selectedLibraryId,
        modal,
        options,
      );
    }
  };
  return {
    execute,
  };
}
