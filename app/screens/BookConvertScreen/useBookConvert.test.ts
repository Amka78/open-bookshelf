import {
  DEFAULT_CONVERT_HEURISTICS,
  DEFAULT_CONVERT_LOOK_AND_FEEL,
  DEFAULT_CONVERT_OUTPUT_EPUB,
  DEFAULT_CONVERT_OUTPUT_MOBI,
  DEFAULT_CONVERT_OUTPUT_PDF,
  DEFAULT_CONVERT_STRUCTURE,
  DEFAULT_CONVERT_TOC,
} from "@/components/BookConvertForm/ConvertOptions"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { act, renderHook, waitFor } from "@testing-library/react"
import { useBookConvert } from "./useBookConvert"

describe("useBookConvert", () => {
  const mockConvert = jest.fn()

  const mockSelectedBook = {
    id: 1,
    metaData: {
      title: "Test Book",
      formats: ["EPUB", "PDF", "MOBI"],
    },
    convert: mockConvert,
  }

  const mockSelectedLibrary = {
    id: "test-library",
    selectedBook: mockSelectedBook,
  }

  const mockCalibreRootStore = {
    selectedLibrary: mockSelectedLibrary,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(api, "getConversionBookData").mockResolvedValue({
      kind: "ok",
      data: {
        input_formats: ["EPUB", "PDF", "MOBI"],
        output_formats: ["EPUB", "AZW3", "MOBI"],
        profiles: {},
        conversion_options: {},
        title: "Test Book",
        authors: ["Author 1"],
        book_id: 1,
      },
    })
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCalibreRootStore,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const renderUseBookConvertAndWaitForInitialization = async () => {
    const hook = renderHook(() => useBookConvert())

    await waitFor(() => {
      expect(hook.result.current.form.getValues().inputFormat).toBe("EPUB")
      expect(hook.result.current.outputFormats).toEqual(["EPUB", "AZW3", "MOBI"])
    })

    return hook
  }

  // ============================================================
  // 初期状態
  // ============================================================
  describe("Initial state", () => {
    test("convertStatus is idle in the initial state", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      expect(result.current.convertStatus).toBe("idle")
    })

    test("errorMessage is null in the initial state", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      expect(result.current.errorMessage).toBeNull()
    })

    test("input formats are returned correctly", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      expect(result.current.inputFormats).toEqual(["EPUB", "PDF", "MOBI"])
    })

    test("output formats are returned from conversion book data", async () => {
      const { result } = renderHook(() => useBookConvert())
      await waitFor(() => {
        expect(result.current.outputFormats).toEqual(["EPUB", "AZW3", "MOBI"])
      })
    })

    test("falls back to input formats when conversion book data fails", async () => {
      jest.spyOn(api, "getConversionBookData").mockResolvedValueOnce({
        kind: "not-found",
        message: "not found",
      })
      ;(useStores as jest.Mock).mockReturnValue({
        calibreRootStore: {
          selectedLibrary: {
            id: "test-library",
            selectedBook: {
              id: 1,
              metaData: { title: "Test", formats: ["PDF"] },
              convert: mockConvert,
            },
          },
        },
      })
      const { result } = renderHook(() => useBookConvert())
      await waitFor(() => {
        expect(result.current.inputFormats).toEqual(["PDF"])
        expect(result.current.outputFormats).toEqual(["PDF"])
      })
    })

    test("syncs the form input format to the first available source format", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      expect(result.current.form.getValues().inputFormat).toBe("EPUB")
    })

    test("clears the selected output format when the fetched output formats no longer include it", async () => {
      let resolveBookData:
        | ((value: Awaited<ReturnType<typeof api.getConversionBookData>>) => void)
        | undefined

      jest.spyOn(api, "getConversionBookData").mockReturnValueOnce(
        new Promise((resolve) => {
          resolveBookData = resolve
        }),
      )

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputFormat", "PDF")
      })

      expect(result.current.form.getValues().outputFormat).toBe("PDF")

      await act(async () => {
        resolveBookData?.({
          kind: "ok",
          data: {
            input_formats: ["EPUB", "PDF", "MOBI"],
            output_formats: ["EPUB", "AZW3", "MOBI"],
            profiles: {},
            conversion_options: {},
            title: "Test Book",
            authors: ["Author 1"],
            book_id: 1,
          },
        })
      })

      await waitFor(() => {
        expect(result.current.form.getValues().outputFormat).toBe("")
      })
    })

    test("react-hook-form is initialized", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      expect(result.current.form).toBeDefined()
      expect(result.current.form.control).toBeDefined()
      expect(result.current.form.watch).toBeDefined()
    })
  })

  // ============================================================
  // デフォルト値
  // ============================================================
  describe("Default values", () => {
    test("Look & Feel default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.lookAndFeel).toEqual(DEFAULT_CONVERT_LOOK_AND_FEEL)
    })

    test("Heuristics default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.heuristics).toEqual(DEFAULT_CONVERT_HEURISTICS)
    })

    test("Structure Detection default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.structureDetection).toEqual(DEFAULT_CONVERT_STRUCTURE)
    })

    test("TOC default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.toc).toEqual(DEFAULT_CONVERT_TOC)
    })

    test("Output EPUB default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.outputEPUB).toEqual(DEFAULT_CONVERT_OUTPUT_EPUB)
    })

    test("Output MOBI default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.outputMOBI).toEqual(DEFAULT_CONVERT_OUTPUT_MOBI)
    })

    test("Output PDF default values are correct", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.outputPDF).toEqual(DEFAULT_CONVERT_OUTPUT_PDF)
    })

    test("initial outputFormat is an empty string", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()
      const values = result.current.form.getValues()
      expect(values.outputFormat).toBe("")
    })
  })

  // ============================================================
  // handleConvert
  // ============================================================
  describe("handleConvert", () => {
    test("convert is not called when outputFormat is empty", async () => {
      const { result } = renderHook(() => useBookConvert())

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(mockConvert).not.toHaveBeenCalled()
    })

    test("convertStatus becomes success on successful conversion", async () => {
      mockConvert.mockResolvedValue(undefined)

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputFormat", "EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(mockConvert).toHaveBeenCalledWith(
        "EPUB",
        "test-library",
        expect.any(Function),
        expect.objectContaining({ outputFormat: "EPUB" }),
      )
      expect(result.current.convertStatus).toBe("success")
      expect(result.current.errorMessage).toBeNull()
    })

    test("convertStatus becomes converting during conversion", async () => {
      let resolveConvert: () => void
      mockConvert.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveConvert = resolve
        }),
      )

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputFormat", "EPUB")
      })

      act(() => {
        result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("converting")

      await act(async () => {
        resolveConvert()
      })
    })

    test("convertStatus becomes error on conversion failure", async () => {
      const errorMessage = "Conversion failed: unsupported format"
      mockConvert.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputFormat", "EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("error")
      expect(result.current.errorMessage).toBe(errorMessage)
    })

    test("errorMessage is set even when a non-Error object is thrown", async () => {
      mockConvert.mockRejectedValue("string error")

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputFormat", "EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("error")
      expect(result.current.errorMessage).toBe("string error")
    })
  })

  // ============================================================
  // handleReset
  // ============================================================
  describe("handleReset", () => {
    test("handleReset resets all states", async () => {
      mockConvert.mockResolvedValue(undefined)
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("outputFormat", "EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("success")

      act(() => {
        result.current.handleReset()
      })

      expect(result.current.form.getValues().outputFormat).toBe("")
      expect(result.current.convertStatus).toBe("idle")
      expect(result.current.errorMessage).toBeNull()
    })

    test("handleReset restores all options to default values", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("lookAndFeel.baseFontSize", 18)
        result.current.form.setValue("heuristics.enabled", true)
        result.current.form.setValue("outputPDF.paperSize", "letter")
      })

      act(() => {
        result.current.handleReset()
      })

      const values = result.current.form.getValues()
      expect(values.lookAndFeel.baseFontSize).toBe(DEFAULT_CONVERT_LOOK_AND_FEEL.baseFontSize)
      expect(values.heuristics.enabled).toBe(DEFAULT_CONVERT_HEURISTICS.enabled)
      expect(values.outputPDF.paperSize).toBe(DEFAULT_CONVERT_OUTPUT_PDF.paperSize)
    })
  })

  // ============================================================
  // オプション設定テスト
  // ============================================================
  describe("Conversion option settings", () => {
    test("Look & Feel - margin settings can be changed", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("lookAndFeel.marginTop", 10)
        result.current.form.setValue("lookAndFeel.marginBottom", 10)
      })

      const values = result.current.form.getValues()
      expect(values.lookAndFeel.marginTop).toBe(10)
      expect(values.lookAndFeel.marginBottom).toBe(10)
    })

    test("Look & Feel - text alignment can be set", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("lookAndFeel.textJustification", "justify")
      })

      expect(result.current.form.getValues().lookAndFeel.textJustification).toBe("justify")
    })

    test("Heuristics - enabled flag can be toggled", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("heuristics.enabled", true)
      })

      expect(result.current.form.getValues().heuristics.enabled).toBe(true)
    })

    test("Structure - chapter mark can be configured", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("structureDetection.chapterMark", "rule")
      })

      expect(result.current.form.getValues().structureDetection.chapterMark).toBe("rule")
    })

    test("TOC - max link count can be configured", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("toc.maxTOCLinks", 100)
      })

      expect(result.current.form.getValues().toc.maxTOCLinks).toBe(100)
    })

    test("Output EPUB - version can be configured", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("outputEPUB.epubVersion", "2")
      })

      expect(result.current.form.getValues().outputEPUB.epubVersion).toBe("2")
    })

    test("Output PDF - paper size can be configured", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("outputPDF.paperSize", "letter")
      })

      expect(result.current.form.getValues().outputPDF.paperSize).toBe("letter")
    })

    test("Output MOBI - file type can be configured", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      act(() => {
        result.current.form.setValue("outputMOBI.mobiFileType", "both")
      })

      expect(result.current.form.getValues().outputMOBI.mobiFileType).toBe("both")
    })
  })

  // ============================================================
  // ストアデータアクセス
  // ============================================================
  describe("Store data access", () => {
    test("selectedBook and selectedLibrary are returned", async () => {
      const { result } = await renderUseBookConvertAndWaitForInitialization()

      expect(result.current.selectedBook).toBe(mockSelectedBook)
      expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
    })
  })
})
