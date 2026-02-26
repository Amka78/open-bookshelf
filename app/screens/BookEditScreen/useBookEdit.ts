import { useStores } from "@/models"
import type { Metadata } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"

const LANGUAGE_LINK_COLUMNS = new Set(["lamg_code", "lang_code"])

function toLanguageCodesForDisplay(value: Metadata, langNames: Record<string, string>): Metadata {
  const codeSet = new Set(Object.keys(langNames))
  const nameToCodeMap = new Map<string, string>()

  Object.entries(langNames).forEach(([code, name]) => {
    nameToCodeMap.set(name, code)
  })

  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => (codeSet.has(entry) ? entry : (nameToCodeMap.get(entry) ?? entry)))

  return {
    ...value,
    languages,
  }
}

function toLanguageNamesForUpdate(value: Metadata, langNames: Record<string, string>): Metadata {
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
  const languageFieldMetadata =
    typeof selectedLibrary.fieldMetadataList?.get === "function"
      ? selectedLibrary.fieldMetadataList.get("languages")
      : undefined
  const isLanguageCodeDisplay = LANGUAGE_LINK_COLUMNS.has(languageFieldMetadata?.linkColumn ?? "")
  const bookMetaDataSnapshot = selectedBook.metaData
    ? (getSnapshot(selectedBook.metaData) as Metadata)
    : undefined
  const normalizedDefaultValues =
    bookMetaDataSnapshot && isLanguageCodeDisplay
      ? toLanguageCodesForDisplay(bookMetaDataSnapshot, bookMetaDataSnapshot.langNames ?? {})
      : bookMetaDataSnapshot

  const form = useForm<Metadata, unknown, Metadata>({
    defaultValues: normalizedDefaultValues,
  })

  const onSubmit = form.handleSubmit((value: Metadata) => {
    const updatedValue =
      isLanguageCodeDisplay && bookMetaDataSnapshot
        ? toLanguageNamesForUpdate(value, bookMetaDataSnapshot.langNames ?? {})
        : value

    selectedBook.update(selectedLibrary.id, updatedValue, Object.keys(updatedValue))
    navigation.goBack()
  })

  return {
    form,
    selectedBook,
    selectedLibrary,
    onSubmit,
  }
}
