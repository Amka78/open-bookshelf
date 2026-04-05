import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { useNavigation } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import { getSnapshot } from "mobx-state-tree"
import { useState } from "react"
import { useForm } from "react-hook-form"

type MetadataFormValues = MetadataSnapshotIn

function toLanguageNamesForDisplay(
  value: MetadataFormValues,
  langNames: Record<string, string>,
): MetadataFormValues {
  const nameSet = new Set(Object.values(langNames))

  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => {
      // すでに名前であればそのまま、言語コードであれば名前に変換する
      if (nameSet.has(entry)) return entry
      return langNames[entry] ?? entry
    })

  return {
    ...value,
    languages,
  }
}

function toLanguageNamesForUpdate(
  value: MetadataFormValues,
  langNames: Record<string, string>,
): MetadataFormValues {
  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => langNames[entry] ?? entry)

  return {
    ...value,
    languages,
  }
}

export function useBookEdit() {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const bookMetaDataSnapshot = selectedBook.metaData
    ? (getSnapshot(selectedBook.metaData) as MetadataFormValues)
    : undefined
  const langNames = bookMetaDataSnapshot?.langNames ?? {}
  const hasLangNames = Object.keys(langNames).length > 0
  const normalizedDefaultValues =
    bookMetaDataSnapshot && hasLangNames
      ? toLanguageNamesForDisplay(bookMetaDataSnapshot, langNames)
      : bookMetaDataSnapshot

  const form = useForm<MetadataFormValues, unknown, MetadataFormValues>({
    defaultValues: normalizedDefaultValues,
  })

  const onSubmit = form.handleSubmit((value: MetadataFormValues) => {
    const updatedValue =
      hasLangNames && bookMetaDataSnapshot ? toLanguageNamesForUpdate(value, langNames) : value

    selectedBook.update(selectedLibrary.id, updatedValue, Object.keys(updatedValue))
    navigation.goBack()
  })

  const pickFormatFromAssetName = (assetName: string | undefined, fallback?: string) => {
    const normalizedFallback = String(fallback ?? "")
      .replace(/^\./u, "")
      .trim()
      .toUpperCase()

    const name = String(assetName ?? "").trim()
    const extensionFromName = name.includes(".") ? name.split(".").pop() : undefined
    const normalizedFromName = String(extensionFromName ?? "")
      .replace(/^\./u, "")
      .trim()
      .toUpperCase()

    return normalizedFromName || normalizedFallback || undefined
  }

  const onUploadFormat = async ({
    targetFormat,
  }: {
    targetFormat?: string
  }): Promise<{ success: boolean; format?: string }> => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
    })

    if (result.canceled || result.assets.length === 0) {
      return { success: false }
    }

    const pickedAsset = result.assets[0]
    const pickedFormat = targetFormat
      ? String(targetFormat).replace(/^\./u, "").trim().toUpperCase()
      : pickFormatFromAssetName(pickedAsset?.name, targetFormat)

    if (!pickedFormat) {
      return { success: false }
    }

    const filePayload = pickedAsset.file ?? pickedAsset.uri
    if (!filePayload) {
      return { success: false }
    }

    const uploadResult = await api.uploadBookFormat(
      selectedLibrary.id,
      selectedBook.id,
      pickedFormat,
      pickedAsset.name,
      filePayload,
    )

    if (uploadResult.kind !== "ok") {
      return { success: false }
    }

    return {
      success: true,
      format: pickedFormat,
    }
  }

  const onDeleteFormat = async (format: string): Promise<boolean> => {
    const deleteResult = await api.deleteBookFormat(selectedLibrary.id, selectedBook.id, format)
    return deleteResult.kind === "ok"
  }

  const [coverUrlInput, setCoverUrlInput] = useState("")
  const [isFetchingCover, setIsFetchingCover] = useState(false)
  const [fetchCoverError, setFetchCoverError] = useState(false)

  const fetchCoverFromUrl = async (): Promise<boolean> => {
    const url = coverUrlInput.trim()
    if (!url) return false
    setIsFetchingCover(true)
    setFetchCoverError(false)
    try {
      const fetchResponse = await fetch(url)
      if (!fetchResponse.ok) {
        setFetchCoverError(true)
        return false
      }
      const blob = await fetchResponse.blob()
      const result = await api.setCoverBinary(selectedLibrary.id, selectedBook.id, blob)
      if (result.kind === "ok") {
        form.setValue("cover" as any, url)
        setCoverUrlInput("")
        return true
      }
      setFetchCoverError(true)
      return false
    } catch {
      setFetchCoverError(true)
      return false
    } finally {
      setIsFetchingCover(false)
    }
  }

  return {
    form,
    selectedBook,
    selectedLibrary,
    onSubmit,
    onUploadFormat,
    onDeleteFormat,
    coverUrlInput,
    setCoverUrlInput,
    isFetchingCover,
    fetchCoverError,
    fetchCoverFromUrl,
  }
}
