import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import { useStores } from "@/models"
import { useState } from "react"

export function useBookConvert() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const formats: string[] = selectedBook?.metaData?.formats ?? []

  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [convertStatus, setConvertStatus] = useState<ConvertStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format)
    // 前の変換状態をリセット
    setConvertStatus("idle")
    setErrorMessage(null)
  }

  const handleConvert = async () => {
    if (!selectedFormat) return

    setConvertStatus("converting")
    setErrorMessage(null)

    try {
      await selectedBook.convert(selectedFormat, selectedLibrary.id, () => {})
      setConvertStatus("success")
    } catch (e) {
      setConvertStatus("error")
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const handleReset = () => {
    setSelectedFormat(null)
    setConvertStatus("idle")
    setErrorMessage(null)
  }

  return {
    selectedBook,
    selectedLibrary,
    formats,
    selectedFormat,
    convertStatus,
    errorMessage,
    handleFormatSelect,
    handleConvert,
    handleReset,
  }
}
