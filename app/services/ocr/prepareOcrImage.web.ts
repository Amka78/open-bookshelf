import { api } from "@/services/api"

export async function prepareOcrImage(imageUrl: string) {
  const response = await api.fetchWithAuth(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to load cover image for OCR: ${response.status}`)
  }

  const blob = await response.blob()
  const source = URL.createObjectURL(blob)

  return {
    source,
    cleanup: () => {
      URL.revokeObjectURL(source)
    },
  }
}
