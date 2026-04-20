import type { MetadataSnapshotIn } from "@/models/calibre"

export type MetadataFormValues = MetadataSnapshotIn

export function toLanguageNamesForDisplay(
  value: MetadataFormValues,
  langNames: Record<string, string>,
): MetadataFormValues {
  const nameSet = new Set(Object.values(langNames))

  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => {
      if (nameSet.has(entry)) return entry
      return langNames[entry] ?? entry
    })

  return {
    ...value,
    languages,
  }
}

export function toLanguageNamesForUpdate(
  value: MetadataFormValues,
  langNames: Record<string, string>,
): MetadataFormValues {
  const nameToCode = Object.fromEntries(
    Object.entries(langNames).map(([code, name]) => [String(name).trim(), code]),
  )

  const languages = value.languages
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .map((entry) => nameToCode[entry] ?? entry)

  return {
    ...value,
    languages,
  }
}

export function buildMetadataFormDefaults(bookMetaDataSnapshot?: MetadataFormValues) {
  const langNames = bookMetaDataSnapshot?.langNames ?? {}
  const hasLangNames = Object.keys(langNames).length > 0

  return {
    bookMetaDataSnapshot,
    hasLangNames,
    langNames,
    normalizedDefaultValues:
      bookMetaDataSnapshot && hasLangNames
        ? toLanguageNamesForDisplay(bookMetaDataSnapshot, langNames)
        : bookMetaDataSnapshot,
  }
}
