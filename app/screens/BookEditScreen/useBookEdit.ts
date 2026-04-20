import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import type { AddedFormatEntry } from "@/services/api/api.types"
import { useNavigation } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import { getSnapshot } from "mobx-state-tree"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  buildMetadataFormDefaults,
  type MetadataFormValues,
  toLanguageNamesForUpdate,
} from "./bookMetadataForm"

export function useBookEdit() {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const bookMetaDataSnapshot = selectedBook.metaData
    ? (getSnapshot(selectedBook.metaData) as MetadataFormValues)
    : undefined
  const { hasLangNames, langNames, normalizedDefaultValues } =
    buildMetadataFormDefaults(bookMetaDataSnapshot)

  const form = useForm<MetadataFormValues, unknown, MetadataFormValues>({
    defaultValues: normalizedDefaultValues,
  })

  const pendingAddedFormats = useRef<AddedFormatEntry[]>([])

  const onSubmit = form.handleSubmit(async (value: MetadataFormValues) => {
    const updatedValue =
      hasLangNames && bookMetaDataSnapshot ? toLanguageNamesForUpdate(value, langNames) : value

    // Compute removed formats by comparing original with current form value
    const originalFormats = (bookMetaDataSnapshot?.formats ?? []).map((f) =>
      String(f).toUpperCase(),
    )
    const currentFormats = (updatedValue.formats ?? []).map((f) => String(f).toUpperCase())
    const removedFormats = originalFormats.filter((f) => !currentFormats.includes(f))

    const formatChanges =
      removedFormats.length > 0 || pendingAddedFormats.current.length > 0
        ? {
            removed_formats: removedFormats.length > 0 ? removedFormats : undefined,
            added_formats:
              pendingAddedFormats.current.length > 0
                ? pendingAddedFormats.current
                : undefined,
          }
        : undefined

    selectedBook.update(selectedLibrary.id, updatedValue, Object.keys(updatedValue), formatChanges)
    calibreRootStore.bumpBookThumbnailRevision(selectedLibrary.id, selectedBook.id)
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

    try {
      const { fileToDataUrl } = await import("@/utils/fileToDataUrl")
      const dataUrl = await fileToDataUrl(filePayload)

      // Remove any prior pending entry for the same format
      pendingAddedFormats.current = pendingAddedFormats.current.filter(
        (e) => e.ext.toUpperCase() !== pickedFormat,
      )
      pendingAddedFormats.current.push({
        ext: pickedFormat,
        data_url: dataUrl,
        name: pickedAsset.name,
        size: pickedAsset.size ?? 0,
        type: pickedAsset.mimeType ?? "application/octet-stream",
      })

      return { success: true, format: pickedFormat }
    } catch {
      return { success: false }
    }
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
        calibreRootStore.bumpBookThumbnailRevision(selectedLibrary.id, selectedBook.id)
        // biome-ignore lint/suspicious/noExplicitAny: react-hook-form setValue path requires any for dynamic field names not in the inferred form schema
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
    coverUrlInput,
    setCoverUrlInput,
    isFetchingCover,
    fetchCoverError,
    fetchCoverFromUrl,
  }
}
