import {
  DEFAULT_CONVERT_OPTIONS,
  type ConvertOptions,
} from "@/components/BookConvertForm/ConvertOptions"
import { convertOptionsToParams } from "./convertOptionsToParams"

const baseOptions = (): ConvertOptions => ({
  outputFormat: "EPUB",
  inputFormat: null,
  ...DEFAULT_CONVERT_OPTIONS,
})

describe("convertOptionsToParams", () => {
  // -------- Look & Feel --------
  describe("Look & Feel", () => {
    test("デフォルトのマージン値 (5.0) がパラメータに含まれること", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.margin_top).toBe(5.0)
      expect(params.margin_bottom).toBe(5.0)
      expect(params.margin_left).toBe(5.0)
      expect(params.margin_right).toBe(5.0)
    })

    test("マージンが 0 の場合はパラメータに含まれないこと", () => {
      const options = baseOptions()
      options.lookAndFeel.marginTop = 0
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("margin_top")
    })

    test("textJustification が null の場合はパラメータに含まれないこと", () => {
      const options = baseOptions()
      options.lookAndFeel.textJustification = null
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("text_justification")
    })

    test("textJustification が設定されている場合はパラメータに含まれること", () => {
      const options = baseOptions()
      options.lookAndFeel.textJustification = "justify"
      const params = convertOptionsToParams(options)
      expect(params.text_justification).toBe("justify")
    })

    test("baseFontSize が 0 の場合はパラメータに含まれないこと", () => {
      const options = baseOptions()
      options.lookAndFeel.baseFontSize = 0
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("base_font_size")
    })

    test("baseFontSize が設定されている場合はパラメータに含まれること", () => {
      const options = baseOptions()
      options.lookAndFeel.baseFontSize = 12
      const params = convertOptionsToParams(options)
      expect(params.base_font_size).toBe(12)
    })

    test("disableFontRescaling が true の場合はパラメータに含まれること", () => {
      const options = baseOptions()
      options.lookAndFeel.disableFontRescaling = true
      const params = convertOptionsToParams(options)
      expect(params.disable_font_rescaling).toBe(true)
    })

    test("disableFontRescaling が false の場合はパラメータに含まれないこと", () => {
      const options = baseOptions()
      options.lookAndFeel.disableFontRescaling = false
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("disable_font_rescaling")
    })

    test("inputEncoding がパラメータに含まれること", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.input_encoding).toBe("utf-8")
    })
  })

  // -------- Heuristics --------
  describe("Heuristics", () => {
    test("heuristics.enabled が false の場合はヒューリスティックパラメータが含まれないこと", () => {
      const options = baseOptions()
      options.heuristics.enabled = false
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("enable_heuristics")
      expect(params).not.toHaveProperty("unwrap_lines")
    })

    test("heuristics.enabled が true の場合は enable_heuristics が含まれること", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      const params = convertOptionsToParams(options)
      expect(params.enable_heuristics).toBe(true)
    })

    test("heuristics.enabled が true かつ unwrapLines が true の場合は unwrap_lines が含まれること", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      options.heuristics.unwrapLines = true
      const params = convertOptionsToParams(options)
      expect(params.unwrap_lines).toBe(true)
    })

    test("heuristics.detectItalics が true の場合は italicize_common_cases が含まれること", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      options.heuristics.detectItalics = true
      const params = convertOptionsToParams(options)
      expect(params.italicize_common_cases).toBe(true)
    })
  })

  // -------- Structure Detection --------
  describe("Structure Detection", () => {
    test("chapter_mark が常に含まれること", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.chapter_mark).toBe("pagebreak")
    })

    test("insertMetadata が true の場合は insert_metadata が含まれること", () => {
      const options = baseOptions()
      options.structureDetection.insertMetadata = true
      const params = convertOptionsToParams(options)
      expect(params.insert_metadata).toBe(true)
    })

    test("removeTableOfContents が true の場合は remove_table_of_contents が含まれること", () => {
      const options = baseOptions()
      options.structureDetection.removeTableOfContents = true
      const params = convertOptionsToParams(options)
      expect(params.remove_table_of_contents).toBe(true)
    })
  })

  // -------- TOC --------
  describe("Table of Contents", () => {
    test("forceUseAutoTOC が true の場合は toc_force_auto_generation が含まれること", () => {
      const options = baseOptions()
      options.toc.forceUseAutoTOC = true
      const params = convertOptionsToParams(options)
      expect(params.toc_force_auto_generation).toBe(true)
    })

    test("maxTOCLinks がデフォルト (50) の場合はパラメータに含まれないこと", () => {
      const options = baseOptions()
      options.toc.maxTOCLinks = 50
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("max_toc_links")
    })

    test("maxTOCLinks がデフォルト以外の場合はパラメータに含まれること", () => {
      const options = baseOptions()
      options.toc.maxTOCLinks = 100
      const params = convertOptionsToParams(options)
      expect(params.max_toc_links).toBe(100)
    })
  })

  // -------- Output EPUB --------
  describe("Output EPUB", () => {
    test("outputFormat が EPUB の場合は epub_version が含まれること", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      const params = convertOptionsToParams(options)
      expect(params.epub_version).toBe("3")
    })

    test("outputFormat が EPUB 以外の場合は epub_version が含まれないこと", () => {
      const options = baseOptions()
      options.outputFormat = "MOBI"
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("epub_version")
    })

    test("preserveCoverAspectRatio が true の場合は preserve_cover_aspect_ratio が含まれること", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      options.outputEPUB.preserveCoverAspectRatio = true
      const params = convertOptionsToParams(options)
      expect(params.preserve_cover_aspect_ratio).toBe(true)
    })

    test("epubVersion が 2 の場合は epub_version が '2' であること", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      options.outputEPUB.epubVersion = "2"
      const params = convertOptionsToParams(options)
      expect(params.epub_version).toBe("2")
    })
  })

  // -------- Output MOBI --------
  describe("Output MOBI", () => {
    test("outputFormat が MOBI の場合は mobi_file_type が含まれること", () => {
      const options = baseOptions()
      options.outputFormat = "MOBI"
      const params = convertOptionsToParams(options)
      expect(params.mobi_file_type).toBe("new")
    })

    test("outputFormat が AZW3 の場合は mobi_file_type が含まれること", () => {
      const options = baseOptions()
      options.outputFormat = "AZW3"
      const params = convertOptionsToParams(options)
      expect(params.mobi_file_type).toBe("new")
    })
  })

  // -------- Output PDF --------
  describe("Output PDF", () => {
    test("outputFormat が PDF の場合は paper_size, orientation, unit が含まれること", () => {
      const options = baseOptions()
      options.outputFormat = "PDF"
      const params = convertOptionsToParams(options)
      expect(params.paper_size).toBe("a4")
      expect(params.orientation).toBe("portrait")
      expect(params.unit).toBe("pt")
    })

    test("outputFormat が PDF 以外の場合は paper_size が含まれないこと", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("paper_size")
    })
  })
})
