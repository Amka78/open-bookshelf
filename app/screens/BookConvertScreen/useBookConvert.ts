import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import {
  type ConvertOptions,
  DEFAULT_CONVERT_OPTIONS,
} from "@/components/BookConvertForm/ConvertOptions"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export function useBookConvert() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const inputFormats: string[] = selectedBook?.metaData?.formats ?? []
  const [outputFormats, setOutputFormats] = useState<string[]>(inputFormats)
  const [isLoadingFormats, setIsLoadingFormats] = useState(false)

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
      return () => {}
    }

    let cancelled = false

    const loadConversionBookData = async () => {
      setIsLoadingFormats(true)
      try {
        const response = await api.getConversionBookData(
          selectedLibrary.id,
          selectedBook.id,
          preferredInputFormat ?? undefined,
        )

        if (cancelled) return

        if (response.kind === "ok") {
          setOutputFormats(response.data.output_formats)

          // Restore outputFormat from server-saved conversion options if available
          const savedOutputFmt = response.data.conversion_options?.output_fmt ?? ""
          const isValidOutputFmt =
            savedOutputFmt && response.data.output_formats.includes(savedOutputFmt)
          const newOutputFormat = isValidOutputFmt ? savedOutputFmt : ""

          const currentOutputFormat = form.getValues("outputFormat")
          if (currentOutputFormat !== newOutputFormat) {
            form.setValue("outputFormat", newOutputFormat)
          }
          return
        }

        setOutputFormats(inputFormats)
      } finally {
        if (!cancelled) {
          setIsLoadingFormats(false)
        }
      }
    }

    void loadConversionBookData()

    return () => {
      cancelled = true
    }
  }, [form, inputFormats, selectedBook?.id, selectedLibrary.id])

  const handleConvert = useCallback(async () => {
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
  }, [form, selectedBook, selectedLibrary.id])

  const handleStartConvert = useCallback(async () => {
    const values = form.getValues()
    if (!values.outputFormat) return null

    setConvertStatus("converting")
    setErrorMessage(null)

    try {
      const jobId = await selectedBook.startConvert(values.outputFormat, selectedLibrary.id, values)
      calibreRootStore.addConversionJob({
        jobId,
        libraryId: selectedLibrary.id,
        bookId: selectedBook.id,
        bookTitle: selectedBook.metaData?.title ?? "",
        inputFormat: values.inputFormat ?? "",
        outputFormat: values.outputFormat,
      })
      setConvertStatus("success")
      return jobId
    } catch (e) {
      setConvertStatus("error")
      setErrorMessage(e instanceof Error ? e.message : String(e))
      return null
    }
  }, [calibreRootStore, form, selectedBook, selectedLibrary.id])

  const handleReset = useCallback(() => {
    form.reset({
      outputFormat: "",
      inputFormat: inputFormats[0] ?? null,
      ...DEFAULT_CONVERT_OPTIONS,
    })
    setConvertStatus("idle")
    setErrorMessage(null)
  }, [form, inputFormats])

  return {
    selectedBook,
    selectedLibrary,
    inputFormats,
    outputFormats,
    isLoadingFormats,
    form,
    convertStatus,
    errorMessage,
    handleConvert,
    handleStartConvert,
    handleReset,
  }
}
