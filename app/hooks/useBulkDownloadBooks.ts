import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
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

export function useBulkDownloadBooks() {
  const { authenticationStore } = useStores()

  const execute = async (
    books: Book[],
    libraryId: string,
    modal: UsableModalProp<ModalStackParams>,
  ) => {
    const header = authenticationStore.getHeader()

    for (const book of books) {
      const format = book.metaData.formats[0]
      if (!format) continue

      try {
        const fileName = `${book.metaData.title}.${format}`
        const downloadUrl = api.getBookDownloadUrl(format, book.id, libraryId)

        if (Platform.OS === "web") {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              const link = document.createElement("a")
              link.href = downloadUrl
              link.download = fileName
              link.rel = "noopener noreferrer"
              document.body.appendChild(link)
              link.click()
              link.remove()
              resolve()
            }, 200)
          })
        } else {
          const documentDirectory = getRequiredDirectoryUri(
            Paths.document?.uri ?? null,
            "Document directory",
          )
          const destination = new File(documentDirectory, fileName)
          const result = await File.downloadFileAsync(downloadUrl, destination, {
            headers: header,
            idempotent: true,
          })
          await Sharing.shareAsync(result.uri)
        }
      } catch (e) {
        modal.openModal("ErrorModal", {
          message: e.message,
          title: e.name,
        })
      }
    }
  }

  return { execute }
}
