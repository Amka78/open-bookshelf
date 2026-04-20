import { useConvergence } from "@/hooks/useConvergence"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { type OcrFieldEntry, recognizeCover } from "@/services/ocr"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { getSnapshot } from "mobx-state-tree"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  buildMetadataFormDefaults,
  type MetadataFormValues,
  toLanguageNamesForDisplay,
  toLanguageNamesForUpdate,
} from "../BookEditScreen/bookMetadataForm"

type BookOcrReviewScreenRouteProp = RouteProp<AppStackParamList, "BookOcrReview">

type OcrState =
  | { status: "loading" }
  | { status: "success"; errorMessage?: undefined }
  | { status: "error"; errorMessage: string }

type BookOcrReviewControllerParams = {
  imageUrl: string
  onComplete: () => void | Promise<void>
  setScreenTitle?: boolean
}

function mergeDetectedMetadata(
  baseValue: MetadataFormValues | undefined,
  detectedValue: Partial<MetadataSnapshotIn>,
): MetadataFormValues | undefined {
  if (!baseValue) {
    return undefined
  }

  return {
    ...baseValue,
    ...detectedValue,
    identifiers: {
      ...(baseValue.identifiers ?? {}),
      ...(detectedValue.identifiers ?? {}),
    },
  }
}

function formatFieldValue(value: OcrFieldEntry["value"], langNames: Record<string, string>) {
  if (Array.isArray(value)) {
    return value.map((entry) => langNames[String(entry)] ?? String(entry)).join(", ")
  }

  if (typeof value === "number") {
    return `${value}`
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => `${key}: ${entryValue}`)
      .join(", ")
  }

  return String(value ?? "")
}

export function useBookOcrReviewController({
  imageUrl,
  onComplete,
  setScreenTitle = false,
}: BookOcrReviewControllerParams) {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const convergenceHook = useConvergence()

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
  const [ocrState, setOcrState] = useState<OcrState>({ status: "loading" })
  const [ocrFieldEntries, setOcrFieldEntries] = useState<OcrFieldEntry[]>([])
  const [recognizedText, setRecognizedText] = useState("")
  const hasInitializedOcrValues = useRef(false)

  useLayoutEffect(() => {
    if (!setScreenTitle) return

    navigation.setOptions({
      title: translate("bookOcrReviewScreen.title"),
    })
  }, [navigation, setScreenTitle])

  useEffect(() => {
    let isActive = true

    const runOcr = async () => {
      setOcrState({ status: "loading" })
      try {
        const result = await recognizeCover({
          imageUrl,
          languages: selectedBook.metaData.languages.slice(),
        })

        if (!isActive) return

        setRecognizedText(result.text)
        setOcrFieldEntries(result.fieldEntries)
        setOcrState({ status: "success" })

        if (!hasInitializedOcrValues.current) {
          const mergedValue = mergeDetectedMetadata(bookMetaDataSnapshot, result.mappedMetadata)
          const normalizedMergedValue =
            mergedValue && hasLangNames ? toLanguageNamesForDisplay(mergedValue, langNames) : mergedValue
          if (normalizedMergedValue) {
            form.reset(normalizedMergedValue)
          }
          hasInitializedOcrValues.current = true
        }
      } catch (error) {
        if (!isActive) return

        setRecognizedText("")
        setOcrFieldEntries([])
        setOcrState({
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : translate("bookOcrReviewScreen.ocrFailed"),
        })
      }
    }

    void runOcr()

    return () => {
      isActive = false
    }
  }, [
    bookMetaDataSnapshot,
    form,
    hasLangNames,
    imageUrl,
    langNames,
    selectedBook.metaData.languages,
  ])

  const applyFieldEntry = (entry: OcrFieldEntry) => {
    if (entry.field === "identifiers") {
      form.setValue(
        "identifiers",
        {
          ...form.getValues("identifiers"),
          ...(entry.value as Record<string, string>),
        } as MetadataFormValues["identifiers"],
        { shouldDirty: true },
      )
      return
    }

    if (entry.field === "languages") {
      const displayLanguages = (entry.value as string[]).map((language) => langNames[language] ?? language)
      form.setValue("languages", displayLanguages as MetadataFormValues["languages"], {
        shouldDirty: true,
      })
      return
    }

    form.setValue(entry.field, entry.value as never, { shouldDirty: true })
  }

  const fieldSummaries = useMemo(() => {
    return ocrFieldEntries.map((entry) => ({
      ...entry,
      displayLabel:
        entry.field === "seriesIndex"
          ? `${selectedLibrary.fieldMetadataList.get("series")?.name ?? "Series"} #`
          : selectedLibrary.fieldMetadataList.get(entry.field)?.name ?? entry.field,
      displayValue: formatFieldValue(entry.value, langNames),
      testID: `book-ocr-apply-${entry.field}`,
    }))
  }, [langNames, ocrFieldEntries, selectedLibrary.fieldMetadataList])

  const onSubmit = form.handleSubmit(async (value) => {
    const updatedValue = hasLangNames ? toLanguageNamesForUpdate(value, langNames) : value
    await selectedBook.update(selectedLibrary.id, updatedValue, Object.keys(updatedValue))
    await onComplete()
  })

  return {
    convergenceHook,
    form,
    ocrState,
    fieldSummaries,
    recognizedText,
    selectedBook,
    selectedLibrary,
    imageUrl,
    onSubmit,
    applyFieldEntry,
  }
}

export function useBookOcrReview() {
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookOcrReviewScreenRouteProp>()

  return useBookOcrReviewController({
    imageUrl: route.params.imageUrl,
    onComplete: () => {
      navigation.goBack()
    },
    setScreenTitle: true,
  })
}
