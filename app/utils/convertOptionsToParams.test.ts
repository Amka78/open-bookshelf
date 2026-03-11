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
    test("default margin value (5.0) is included in parameters", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.margin_top).toBe(5.0)
      expect(params.margin_bottom).toBe(5.0)
      expect(params.margin_left).toBe(5.0)
      expect(params.margin_right).toBe(5.0)
    })

    test("margin is not included when value is 0", () => {
      const options = baseOptions()
      options.lookAndFeel.marginTop = 0
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("margin_top")
    })

    test("textJustification is not included when null", () => {
      const options = baseOptions()
      options.lookAndFeel.textJustification = null
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("text_justification")
    })

    test("textJustification is included when set", () => {
      const options = baseOptions()
      options.lookAndFeel.textJustification = "justify"
      const params = convertOptionsToParams(options)
      expect(params.text_justification).toBe("justify")
    })

    test("baseFontSize is not included when value is 0", () => {
      const options = baseOptions()
      options.lookAndFeel.baseFontSize = 0
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("base_font_size")
    })

    test("baseFontSize is included when set", () => {
      const options = baseOptions()
      options.lookAndFeel.baseFontSize = 12
      const params = convertOptionsToParams(options)
      expect(params.base_font_size).toBe(12)
    })

    test("disableFontRescaling is included when true", () => {
      const options = baseOptions()
      options.lookAndFeel.disableFontRescaling = true
      const params = convertOptionsToParams(options)
      expect(params.disable_font_rescaling).toBe(true)
    })

    test("disableFontRescaling is not included when false", () => {
      const options = baseOptions()
      options.lookAndFeel.disableFontRescaling = false
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("disable_font_rescaling")
    })

    test("inputEncoding is included in parameters", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.input_encoding).toBe("utf-8")
    })
  })

  // -------- Heuristics --------
  describe("Heuristics", () => {
    test("heuristic parameters are not included when heuristics.enabled is false", () => {
      const options = baseOptions()
      options.heuristics.enabled = false
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("enable_heuristics")
      expect(params).not.toHaveProperty("unwrap_lines")
    })

    test("enable_heuristics is included when heuristics.enabled is true", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      const params = convertOptionsToParams(options)
      expect(params.enable_heuristics).toBe(true)
    })

    test("unwrap_lines is included when heuristics.enabled and unwrapLines are true", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      options.heuristics.unwrapLines = true
      const params = convertOptionsToParams(options)
      expect(params.unwrap_lines).toBe(true)
    })

    test("italicize_common_cases is included when heuristics.detectItalics is true", () => {
      const options = baseOptions()
      options.heuristics.enabled = true
      options.heuristics.detectItalics = true
      const params = convertOptionsToParams(options)
      expect(params.italicize_common_cases).toBe(true)
    })
  })

  // -------- Structure Detection --------
  describe("Structure Detection", () => {
    test("chapter_mark is always included", () => {
      const params = convertOptionsToParams(baseOptions())
      expect(params.chapter_mark).toBe("pagebreak")
    })

    test("insert_metadata is included when insertMetadata is true", () => {
      const options = baseOptions()
      options.structureDetection.insertMetadata = true
      const params = convertOptionsToParams(options)
      expect(params.insert_metadata).toBe(true)
    })

    test("remove_table_of_contents is included when removeTableOfContents is true", () => {
      const options = baseOptions()
      options.structureDetection.removeTableOfContents = true
      const params = convertOptionsToParams(options)
      expect(params.remove_table_of_contents).toBe(true)
    })
  })

  // -------- TOC --------
  describe("Table of Contents", () => {
    test("toc_force_auto_generation is included when forceUseAutoTOC is true", () => {
      const options = baseOptions()
      options.toc.forceUseAutoTOC = true
      const params = convertOptionsToParams(options)
      expect(params.toc_force_auto_generation).toBe(true)
    })

    test("maxTOCLinks is not included when using the default value (50)", () => {
      const options = baseOptions()
      options.toc.maxTOCLinks = 50
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("max_toc_links")
    })

    test("maxTOCLinks is included when using a non-default value", () => {
      const options = baseOptions()
      options.toc.maxTOCLinks = 100
      const params = convertOptionsToParams(options)
      expect(params.max_toc_links).toBe(100)
    })
  })

  // -------- Output EPUB --------
  describe("Output EPUB", () => {
    test("epub_version is included when outputFormat is EPUB", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      const params = convertOptionsToParams(options)
      expect(params.epub_version).toBe("3")
    })

    test("epub_version is not included when outputFormat is not EPUB", () => {
      const options = baseOptions()
      options.outputFormat = "MOBI"
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("epub_version")
    })

    test("preserve_cover_aspect_ratio is included when preserveCoverAspectRatio is true", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      options.outputEPUB.preserveCoverAspectRatio = true
      const params = convertOptionsToParams(options)
      expect(params.preserve_cover_aspect_ratio).toBe(true)
    })

    test("epub_version is '2' when epubVersion is 2", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      options.outputEPUB.epubVersion = "2"
      const params = convertOptionsToParams(options)
      expect(params.epub_version).toBe("2")
    })
  })

  // -------- Output MOBI --------
  describe("Output MOBI", () => {
    test("mobi_file_type is included when outputFormat is MOBI", () => {
      const options = baseOptions()
      options.outputFormat = "MOBI"
      const params = convertOptionsToParams(options)
      expect(params.mobi_file_type).toBe("new")
    })

    test("mobi_file_type is included when outputFormat is AZW3", () => {
      const options = baseOptions()
      options.outputFormat = "AZW3"
      const params = convertOptionsToParams(options)
      expect(params.mobi_file_type).toBe("new")
    })
  })

  // -------- Output PDF --------
  describe("Output PDF", () => {
    test("paper_size, orientation, and unit are included when outputFormat is PDF", () => {
      const options = baseOptions()
      options.outputFormat = "PDF"
      const params = convertOptionsToParams(options)
      expect(params.paper_size).toBe("a4")
      expect(params.orientation).toBe("portrait")
      expect(params.unit).toBe("pt")
    })

    test("paper_size is not included when outputFormat is not PDF", () => {
      const options = baseOptions()
      options.outputFormat = "EPUB"
      const params = convertOptionsToParams(options)
      expect(params).not.toHaveProperty("paper_size")
    })
  })
})
