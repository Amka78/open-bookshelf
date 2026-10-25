import type { Category, FieldMetadata, FieldMetadataMap, Metadata, MetadataSnapshotIn } from "@/models/calibre"
import type { Path } from "react-hook-form"
import { useEditFieldSuggestions } from "./useEditFieldSuggestions"

/** Standard field labels shown in the fixed sorted order */
export const EditFieldSort = [
  "authors",
  "authorSort",
  "title",
  "sort",
  "series",
  "tags",
  "languages",
  "publisher",
  "pubdate",
  "formats",
  "identifiers",
  "rating",
  "comments",
]

export type BookEditFieldEntry = {
  label: string
  formPath: Path<MetadataSnapshotIn>
  metadata: FieldMetadata
  suggestions?: string[]
}

type UseBookEditFieldsParams = {
  fieldMetadataList: FieldMetadataMap
  tagBrowser?: Category[]
  metaData?: Metadata
}

/**
 * 編集可能フィールドの列挙（standard は EditFieldSort 順、custom はカスタムカラム）。
 * BookEditFieldList（モーダル/OCR用）と BookEditFieldNavList（EditScreen用）で共通利用する。
 */
export function useBookEditFields(params: UseBookEditFieldsParams): {
  standardFields: BookEditFieldEntry[]
  customFields: BookEditFieldEntry[]
} {
  const { suggestionMap, languageCodeSuggestions } = useEditFieldSuggestions({
    tagBrowser: params.tagBrowser,
    metaData: params.metaData,
  })

  const standardFields: BookEditFieldEntry[] = []
  for (const label of EditFieldSort) {
    const metadata = params.fieldMetadataList.get(label)
    if (!metadata || !metadata.isEditable || !metadata.name) {
      continue
    }

    const isLanguageCodeColumn =
      label === "languages" &&
      (metadata.linkColumn === "lamg_code" || metadata.linkColumn === "lang_code")

    standardFields.push({
      label,
      formPath: label as Path<MetadataSnapshotIn>,
      metadata,
      suggestions: isLanguageCodeColumn
        ? languageCodeSuggestions ?? undefined
        : suggestionMap.get(metadata.label),
    })
  }

  const customFields: BookEditFieldEntry[] = Array.from(params.fieldMetadataList.values())
    .filter((f) => f.isCustom && f.isEditable && f.name)
    .map((f) => ({
      label: f.label,
      formPath: `customColumns.${f.label}` as Path<MetadataSnapshotIn>,
      metadata: f,
      suggestions: suggestionMap.get(f.label),
    }))

  return { standardFields, customFields }
}