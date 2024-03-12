import type { UsableModalProp } from "react-native-modalfy"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import type { LibraryMap } from "@/models/CalibreRootStore"

export function useDownloadBook() {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const execute = async (modal: UsableModalProp<ModalStackParams>) => {
    try {
      if (selectedBook.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: selectedBook.metaData.formats,
          onSelectFormat: async (format) => {
            await executeSharing(
              selectedLibrary,
              settingStore.api.baseUrl,
              authenticationStore.getHeader(),
              format,
            )
          },
        })
      } else {
        await executeSharing(
          selectedLibrary,
          settingStore.api.baseUrl,
          authenticationStore.getHeader(),
          selectedBook.metaData.formats[0],
        )
      }
    } catch (e) {
      modal.openModal("ErrorModal", {
        message: e.message,
        title: e.name,
      })
    }
  }

  return {
    execute,
  }
}

async function executeSharing(
  selectedLibrary: LibraryMap,
  baseUrl: string,
  header: { Authorization: string },
  format: string,
) {
  const selectedBook = selectedLibrary.selectedBook
  const fileName = `${selectedBook.metaData.title}.${format}`
  const result = await FileSystem.downloadAsync(
    `${baseUrl}/get/${selectedBook.metaData.formats[0]}/${selectedBook.id}/${selectedLibrary.id}`,
    FileSystem.documentDirectory + fileName,
    {
      headers: header,
    },
  )
  await Sharing.shareAsync(result.uri)
}
