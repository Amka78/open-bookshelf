import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { getSnapshot } from "mobx-state-tree"
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

  return {
    form,
    selectedBook,
    selectedLibrary,
    onSubmit,
  }
}
