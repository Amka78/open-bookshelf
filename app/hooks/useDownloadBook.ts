import type { UsableModalProp } from "react-native-modalfy";
import type { ModalStackParams } from "@/components/Modals/Types";
import { useStores } from "@/models";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { LibraryMap } from "@/models/CalibreRootStore";
import { api } from "@/services/api";

export function useDownloadBook() {
  const { authenticationStore, calibreRootStore } = useStores();

  const selectedLibrary = calibreRootStore.selectedLibrary;
  const selectedBook = selectedLibrary.selectedBook;
  const execute = async (modal: UsableModalProp<ModalStackParams>) => {
    try {
      if (selectedBook.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: selectedBook.metaData.formats,
          onSelectFormat: async (format) => {
            await executeSharing(
              selectedLibrary,
              authenticationStore.getHeader(),
              format,
            );
          },
        });
      } else {
        await executeSharing(
          selectedLibrary,
          authenticationStore.getHeader(),
          selectedBook.metaData.formats[0],
        );
      }
    } catch (e) {
      modal.openModal("ErrorModal", {
        message: e.message,
        title: e.name,
      });
    }
  };

  return {
    execute,
  };
}

async function executeSharing(
  selectedLibrary: LibraryMap,
  header: { Authorization: string },
  format: string,
) {
  const selectedBook = selectedLibrary.selectedBook;
  const fileName = `${selectedBook.metaData.title}.${format}`;
  const result = await FileSystem.downloadAsync(
    api.getBookDownloadUrl(format, selectedBook.id, selectedLibrary.id),
    FileSystem.documentDirectory + fileName,
    {
      headers: header,
    },
  );
  await Sharing.shareAsync(result.uri);
}
