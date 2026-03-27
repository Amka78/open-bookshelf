import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import {
  type ConvertOptions,
  DEFAULT_CONVERT_OPTIONS,
} from "@/components/BookConvertForm/ConvertOptions"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export function useBookConvert() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const inputFormats: string[] = selectedBook?.metaData?.formats ?? []
  const [outputFormats, setOutputFormats] = useState<string[]>(inputFormats)

  const [convertStatus, setConvertStatus] = useState<ConvertStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<ConvertOptions>({
    defaultValues: {
      outputFormat: "",
      inputFormat: inputFormats[0] ?? null,
      ...DEFAULT_CONVERT_OPTIONS,
    },
  })

  useEffect(() => {
    const preferredInputFormat = inputFormats[0] ?? null
    form.setValue("inputFormat", preferredInputFormat)

    if (!selectedBook?.id) {
      setOutputFormats(inputFormats)
      return
    }

    let cancelled = false

    const loadConversionBookData = async () => {
      const response = await api.getConversionBookData(
        selectedLibrary.id,
        selectedBook.id,
        preferredInputFormat ?? undefined,
      )

      if (cancelled) return

      if (response.kind === "ok") {
        setOutputFormats(response.data.output_formats)
        const currentOutputFormat = form.getValues("outputFormat")
        if (currentOutputFormat && !response.data.output_formats.includes(currentOutputFormat)) {
          form.setValue("outputFormat", "")
        }
        return
      }

      setOutputFormats(inputFormats)
    }

    void loadConversionBookData()

    return () => {
      cancelled = true
    }
  }, [form, inputFormats, selectedBook?.id, selectedLibrary.id])

  const handleConvert = async () => {
    const values = form.getValues()
    if (!values.outputFormat) return

    setConvertStatus("converting")
    setErrorMessage(null)

    try {
      await selectedBook.convert(values.outputFormat, selectedLibrary.id, async () => {}, values)
      setConvertStatus("success")
    } catch (e) {
      setConvertStatus("error")
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const handleReset = () => {
    form.reset({
      outputFormat: "",
      inputFormat: inputFormats[0] ?? null,
      ...DEFAULT_CONVERT_OPTIONS,
    })
    setConvertStatus("idle")
    setErrorMessage(null)
  }

  return {
    selectedBook,
    selectedLibrary,
    inputFormats,
    outputFormats,
    form,
    convertStatus,
    errorMessage,
    handleConvert,
    handleReset,
  }
}
