import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"

/**
 * ConvertOptions を Calibre Content Server のクエリパラメータ形式
 * (snake_case) に変換する。
 *
 * 値が null / undefined の場合や、数値オプションが 0 (= 自動/無効) の
 * 場合はパラメータに含めない。
 */
export function convertOptionsToParams(
  options: ConvertOptions,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}

  // ---- Look & Feel ----
  const laf = options.lookAndFeel
  if (laf.marginTop !== 0) params.margin_top = laf.marginTop
  if (laf.marginBottom !== 0) params.margin_bottom = laf.marginBottom
  if (laf.marginLeft !== 0) params.margin_left = laf.marginLeft
  if (laf.marginRight !== 0) params.margin_right = laf.marginRight
  if (laf.textJustification !== null) params.text_justification = laf.textJustification
  if (laf.baseFontSize !== 0) params.base_font_size = laf.baseFontSize
  if (laf.lineHeight !== 0) params.line_height = laf.lineHeight
  if (laf.inputEncoding) params.input_encoding = laf.inputEncoding
  if (laf.disableFontRescaling) params.disable_font_rescaling = true
  if (laf.removeASCIIReplacements) params.remove_ascii_replacements = true

  // ---- Heuristic Processing ----
  const heuristics = options.heuristics
  if (heuristics.enabled) {
    params.enable_heuristics = true
    if (heuristics.unwrapLines) params.unwrap_lines = true
    if (heuristics.deleteBlankLines) params.delete_blank_paragraphs = true
    if (heuristics.formatSceneBreaks) params.format_scene_breaks = true
    if (heuristics.renumberHeadings) params.renumber_headings = true
    if (heuristics.detectItalics) params.italicize_common_cases = true
  }

  // ---- Structure Detection ----
  const structure = options.structureDetection
  if (structure.insertMetadata) params.insert_metadata = true
  if (structure.pageBreaksBeforeChapters) params.page_breaks_before_chapter = true
  if (structure.removeFirstImage) params.remove_first_image = true
  if (structure.removeTableOfContents) params.remove_table_of_contents = true
  params.chapter_mark = structure.chapterMark

  // ---- Table of Contents ----
  const toc = options.toc
  if (toc.forceUseAutoTOC) params.toc_force_auto_generation = true
  if (toc.noInlineTOC) params.no_inline_toc = true
  if (toc.maxTOCLinks !== 50) params.max_toc_links = toc.maxTOCLinks
  if (toc.numberOfHeadingsForAutoTOC !== 6)
    params.toc_threshold = toc.numberOfHeadingsForAutoTOC

  // ---- Output format-specific ----
  const fmt = options.outputFormat?.toUpperCase()

  if (fmt === "EPUB") {
    const epub = options.outputEPUB
    params.epub_version = epub.epubVersion
    if (epub.preserveCoverAspectRatio) params.preserve_cover_aspect_ratio = true
    if (epub.noDefaultCover) params.no_default_epub_cover = true
    if (epub.noSVGCover) params.no_svg_cover = true
    if (epub.flattenFiles) params.flatten_epub_files = true
  }

  if (fmt === "MOBI" || fmt === "AZW3" || fmt === "KF8") {
    const mobi = options.outputMOBI
    params.mobi_file_type = mobi.mobiFileType
    if (mobi.noInlineTable) params.dont_split_on_page_breaks = true
  }

  if (fmt === "PDF") {
    const pdf = options.outputPDF
    params.paper_size = pdf.paperSize
    params.orientation = pdf.orientation
    params.unit = pdf.unit
  }

  return params
}
