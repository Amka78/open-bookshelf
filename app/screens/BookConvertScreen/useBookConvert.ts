import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import {
  type ConvertOptions,
  DEFAULT_CONVERT_OPTIONS,
} from "@/components/BookConvertForm/ConvertOptions"
import { useStores } from "@/models"
import { useState } from "react"
import { useForm } from "react-hook-form"

export function useBookConvert() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const formats: string[] = selectedBook?.metaData?.formats ?? []

  const [convertStatus, setConvertStatus] = useState<ConvertStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<ConvertOptions>({
    defaultValues: {
      outputFormat: "",
      inputFormat: null,
      ...DEFAULT_CONVERT_OPTIONS,
    },
  })

  const handleConvert = async () => {
    const values = form.getValues()
    if (!values.outputFormat) return

    setConvertStatus("converting")
    setErrorMessage(null)

    try {
      await selectedBook.convert(values.outputFormat, selectedLibrary.id, () => {}, values)
      setConvertStatus("success")
    } catch (e) {
      setConvertStatus("error")
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const handleReset = () => {
    form.reset({
      outputFormat: "",
      inputFormat: null,
      ...DEFAULT_CONVERT_OPTIONS,
    })
    setConvertStatus("idle")
    setErrorMessage(null)
  }

  return {
    selectedBook,
    selectedLibrary,
    formats,
    form,
    convertStatus,
    errorMessage,
    handleConvert,
    handleReset,
  }
}
