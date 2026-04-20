import { api } from "@/services/api"
import { Directory, File, Paths } from "expo-file-system"

const getRequiredDirectoryUri = (directory: string | null, label: string) => {
  if (!directory) {
    throw new Error(`${label} is unavailable`)
  }

  return directory.endsWith("/") ? directory : `${directory}/`
}

export async function prepareOcrImage(imageUrl: string) {
  const cacheRoot = getRequiredDirectoryUri(Paths.cache?.uri ?? null, "Cache directory")
  const ocrDirectory = new Directory(cacheRoot, "ocr")
  ocrDirectory.create({ idempotent: true, intermediates: true })

  const file = new File(ocrDirectory, `cover-${Date.now()}.jpg`)
  const result = await api.downloadFileWithAuth(imageUrl, file, {
    idempotent: true,
  })

  return {
    source: result.uri,
    cleanup: () => {
      if (file.exists) {
        file.delete()
      }
    },
  }
}
