/**
 * CalibreのConvert処理に相当する変換オプション型定義
 * Calibreの変換ダイアログの各タブに対応する設定グループを持つ
 */

// ============================================================
// Look & Feel
// ============================================================
export type TextJustification = "left" | "right" | "center" | "justify"

export type ConvertLookAndFeelOptions = {
  /** ページ上余白 (mm). 0=デフォルト */
  marginTop: number
  /** ページ下余白 (mm) */
  marginBottom: number
  /** ページ左余白 (mm) */
  marginLeft: number
  /** ページ右余白 (mm) */
  marginRight: number
  /** テキスト揃え */
  textJustification: TextJustification | null
  /** ベースフォントサイズ (pt). 0=自動 */
  baseFontSize: number
  /** 行高さ (pt). 0=自動 */
  lineHeight: number
  /** 入力エンコーディング (例: utf-8) */
  inputEncoding: string
  /** フォントサイズ自動調整を無効化 */
  disableFontRescaling: boolean
  /** ASCII 文字代替を削除 */
  removeASCIIReplacements: boolean
}

// ============================================================
// Heuristic Processing
// ============================================================
export type ConvertHeuristicsOptions = {
  /** ヒューリスティック処理を有効化 */
  enabled: boolean
  /** 行の折り返しを解除 */
  unwrapLines: boolean
  /** 空行を削除 */
  deleteBlankLines: boolean
  /** シーン区切りを整形 */
  formatSceneBreaks: boolean
  /** 見出し番号を振り直す */
  renumberHeadings: boolean
  /** イタリック検出 */
  detectItalics: boolean
}

// ============================================================
// Structure Detection
// ============================================================
export type ChapterMark = "pagebreak" | "rule" | "both" | "none"

export type ConvertStructureDetectionOptions = {
  /** メタデータを先頭ページとして挿入 */
  insertMetadata: boolean
  /** 章の前にページ区切りを挿入 */
  pageBreaksBeforeChapters: boolean
  /** 最初の画像を削除 */
  removeFirstImage: boolean
  /** 目次を削除 */
  removeTableOfContents: boolean
  /** 章の区切りマーク種別 */
  chapterMark: ChapterMark
}

// ============================================================
// Table of Contents
// ============================================================
export type ConvertTOCOptions = {
  /** 自動生成 TOC を強制使用 */
  forceUseAutoTOC: boolean
  /** インライン TOC を追加しない */
  noInlineTOC: boolean
  /** TOC に含める最大リンク数 */
  maxTOCLinks: number
  /** 自動 TOC 用見出し数 */
  numberOfHeadingsForAutoTOC: number
}

// ============================================================
// Output EPUB Options
// ============================================================
export type EPUBVersion = "2" | "3"

export type ConvertOutputEPUBOptions = {
  /** EPUB バージョン */
  epubVersion: EPUBVersion
  /** カバー画像のアスペクト比を維持 */
  preserveCoverAspectRatio: boolean
  /** デフォルトカバーを追加しない */
  noDefaultCover: boolean
  /** SVG カバーを使わない */
  noSVGCover: boolean
  /** HTML ファイル構造を平坦化 */
  flattenFiles: boolean
}

// ============================================================
// Output MOBI / AZW3 Options
// ============================================================
export type MobiFileType = "old" | "new" | "both"

export type ConvertOutputMOBIOptions = {
  /** MOBI ファイル形式 */
  mobiFileType: MobiFileType
  /** テーブルのインライン展開を無効化 */
  noInlineTable: boolean
}

// ============================================================
// Output PDF Options
// ============================================================
export type PDFPaperSize =
  | "a0"
  | "a1"
  | "a2"
  | "a3"
  | "a4"
  | "a5"
  | "a6"
  | "b3"
  | "b4"
  | "b5"
  | "letter"
  | "legal"
  | "executive"
export type PDFOrientation = "portrait" | "landscape"
export type PDFUnit = "pt" | "mm" | "inch"

export type ConvertOutputPDFOptions = {
  /** 用紙サイズ */
  paperSize: PDFPaperSize
  /** ページ方向 */
  orientation: PDFOrientation
  /** 単位 */
  unit: PDFUnit
}

// ============================================================
// Root ConvertOptions
// ============================================================
export type ConvertOptions = {
  /** 変換先フォーマット */
  outputFormat: string
  /** 変換元フォーマット (null=自動選択) */
  inputFormat: string | null
  lookAndFeel: ConvertLookAndFeelOptions
  heuristics: ConvertHeuristicsOptions
  structureDetection: ConvertStructureDetectionOptions
  toc: ConvertTOCOptions
  outputEPUB: ConvertOutputEPUBOptions
  outputMOBI: ConvertOutputMOBIOptions
  outputPDF: ConvertOutputPDFOptions
}

// ============================================================
// Default values (Calibre デフォルト準拠)
// ============================================================
export const DEFAULT_CONVERT_LOOK_AND_FEEL: ConvertLookAndFeelOptions = {
  marginTop: 5.0,
  marginBottom: 5.0,
  marginLeft: 5.0,
  marginRight: 5.0,
  textJustification: null,
  baseFontSize: 0,
  lineHeight: 0,
  inputEncoding: "utf-8",
  disableFontRescaling: false,
  removeASCIIReplacements: false,
}

export const DEFAULT_CONVERT_HEURISTICS: ConvertHeuristicsOptions = {
  enabled: false,
  unwrapLines: true,
  deleteBlankLines: true,
  formatSceneBreaks: true,
  renumberHeadings: true,
  detectItalics: false,
}

export const DEFAULT_CONVERT_STRUCTURE: ConvertStructureDetectionOptions = {
  insertMetadata: false,
  pageBreaksBeforeChapters: false,
  removeFirstImage: false,
  removeTableOfContents: false,
  chapterMark: "pagebreak",
}

export const DEFAULT_CONVERT_TOC: ConvertTOCOptions = {
  forceUseAutoTOC: false,
  noInlineTOC: false,
  maxTOCLinks: 50,
  numberOfHeadingsForAutoTOC: 6,
}

export const DEFAULT_CONVERT_OUTPUT_EPUB: ConvertOutputEPUBOptions = {
  epubVersion: "3",
  preserveCoverAspectRatio: false,
  noDefaultCover: false,
  noSVGCover: false,
  flattenFiles: false,
}

export const DEFAULT_CONVERT_OUTPUT_MOBI: ConvertOutputMOBIOptions = {
  mobiFileType: "new",
  noInlineTable: false,
}

export const DEFAULT_CONVERT_OUTPUT_PDF: ConvertOutputPDFOptions = {
  paperSize: "a4",
  orientation: "portrait",
  unit: "pt",
}

export const DEFAULT_CONVERT_OPTIONS: Omit<ConvertOptions, "outputFormat" | "inputFormat"> = {
  lookAndFeel: DEFAULT_CONVERT_LOOK_AND_FEEL,
  heuristics: DEFAULT_CONVERT_HEURISTICS,
  structureDetection: DEFAULT_CONVERT_STRUCTURE,
  toc: DEFAULT_CONVERT_TOC,
  outputEPUB: DEFAULT_CONVERT_OUTPUT_EPUB,
  outputMOBI: DEFAULT_CONVERT_OUTPUT_MOBI,
  outputPDF: DEFAULT_CONVERT_OUTPUT_PDF,
}
