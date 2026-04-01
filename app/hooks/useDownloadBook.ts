import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { LibraryMap } from "@/models/CalibreRootStore"
import { api } from "@/services/api"
import { File, Paths } from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Platform } from "react-native"
import type { UsableModalProp } from "react-native-modalfy"

const getRequiredDirectoryUri = (directory: string | null, label: string) => {
  if (!directory) {
    throw new Error(`${label} is unavailable`)
  }

  return directory.endsWith("/") ? directory : `${directory}/`
}

export function useDownloadBook() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const execute = async (modal: UsableModalProp<ModalStackParams>) => {
    try {
      if (selectedBook.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: selectedBook.metaData.formats,
          onSelectFormat: async (format) => {
            await executeSharing(selectedLibrary, format)
          },
        })
      } else {
        const format = selectedBook.metaData.formats[0]
        await executeSharing(selectedLibrary, format)
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
  format: string,
) {
  const selectedBook = selectedLibrary.selectedBook
  const fileName = `${selectedBook.metaData.title}.${format}`
  const downloadUrl = api.getBookDownloadUrl(format, selectedBook.id, selectedLibrary.id)

  if (Platform.OS === "web") {
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = fileName
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    link.remove()
    return
  }

  const documentDirectory = getRequiredDirectoryUri(
    Paths.document?.uri ?? null,
    "Document directory",
  )
  const destination = new File(documentDirectory, fileName)
  const result = await api.downloadFileWithAuth(downloadUrl, destination, {
    idempotent: true,
  })
  await Sharing.shareAsync(result.uri)
}
