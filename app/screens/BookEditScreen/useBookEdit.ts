import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { getSnapshot } from "mobx-state-tree"
import { useForm } from "react-hook-form"

type MetadataFormValues = MetadataSnapshotIn

const LANGUAGE_LINK_COLUMNS = new Set(["lamg_code", "lang_code"])

function toLanguageCodesForDisplay(
  value: MetadataFormValues,
  langNames: Record<string, string>,
): MetadataFormValues {
  const codeSet = new Set(Object.keys(langNames))
  const nameToCodeMap = new Map<string, string>()

  Object.entries(langNames).forEach(([code, name]) => {
    nameToCodeMap.set(name, code)
  })

  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => (codeSet.has(entry) ? entry : nameToCodeMap.get(entry) ?? entry))

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
  const languageFieldMetadata =
    typeof selectedLibrary.fieldMetadataList?.get === "function"
      ? selectedLibrary.fieldMetadataList.get("languages")
      : undefined
  const isLanguageCodeDisplay = LANGUAGE_LINK_COLUMNS.has(languageFieldMetadata?.linkColumn ?? "")
  const bookMetaDataSnapshot = selectedBook.metaData
    ? (getSnapshot(selectedBook.metaData) as MetadataFormValues)
    : undefined
  const normalizedDefaultValues =
    bookMetaDataSnapshot && isLanguageCodeDisplay
      ? toLanguageCodesForDisplay(bookMetaDataSnapshot, bookMetaDataSnapshot.langNames ?? {})
      : bookMetaDataSnapshot

  const form = useForm<MetadataFormValues, unknown, MetadataFormValues>({
    defaultValues: normalizedDefaultValues,
  })

  const onSubmit = form.handleSubmit((value: MetadataFormValues) => {
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
