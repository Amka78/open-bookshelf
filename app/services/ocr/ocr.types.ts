import type { MetadataSnapshotIn } from "@/models/calibre"

export type OcrMappedField =
  | "title"
  | "authors"
  | "publisher"
  | "series"
  | "seriesIndex"
  | "identifiers"
  | "languages"

export type OcrMappedMetadata = Partial<Pick<MetadataSnapshotIn, OcrMappedField>>

export type OcrFieldEntry = {
  field: OcrMappedField
  value: OcrMappedMetadata[OcrMappedField]
  confidence?: number
  sourceText?: string
}

export type OcrResult = {
  text: string
  lines: string[]
  mappedMetadata: OcrMappedMetadata
  fieldEntries: OcrFieldEntry[]
}

export type RawOcrLine = {
  text: string
  confidence?: number
}

export type RawOcrResult = {
  text: string
  lines: RawOcrLine[]
}
