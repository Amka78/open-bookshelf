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
import { act, renderHook } from "@testing-library/react"
import { useBookConvert } from "./useBookConvert"

jest.mock("@/models")

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
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCalibreRootStore,
    })
  })

  // ============================================================
  // 初期状態
  // ============================================================
  describe("初期状態", () => {
    test("初期状態では convertStatus が idle であること", () => {
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.convertStatus).toBe("idle")
    })

    test("初期状態では errorMessage が null であること", () => {
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.errorMessage).toBeNull()
    })

    test("bookの formats が正しく返されること", () => {
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.formats).toEqual(["EPUB", "PDF", "MOBI"])
    })

    test("formatsが存在しない場合は空配列を返すこと", () => {
      ;(useStores as jest.Mock).mockReturnValue({
        calibreRootStore: {
          selectedLibrary: {
            id: "test-library",
            selectedBook: {
              id: 1,
              metaData: { title: "Test", formats: null },
              convert: mockConvert,
            },
          },
        },
      })
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.formats).toEqual([])
    })

    test("react-hook-form が初期化されていること", () => {
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.form).toBeDefined()
      expect(result.current.form.control).toBeDefined()
      expect(result.current.form.watch).toBeDefined()
    })
  })

  // ============================================================
  // デフォルト値
  // ============================================================
  describe("デフォルト値", () => {
    test("Look & Feel のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.lookAndFeel).toEqual(DEFAULT_CONVERT_LOOK_AND_FEEL)
    })

    test("Heuristics のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.heuristics).toEqual(DEFAULT_CONVERT_HEURISTICS)
    })

    test("Structure Detection のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.structureDetection).toEqual(DEFAULT_CONVERT_STRUCTURE)
    })

    test("TOC のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.toc).toEqual(DEFAULT_CONVERT_TOC)
    })

    test("Output EPUB のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.outputEPUB).toEqual(DEFAULT_CONVERT_OUTPUT_EPUB)
    })

    test("Output MOBI のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.outputMOBI).toEqual(DEFAULT_CONVERT_OUTPUT_MOBI)
    })

    test("Output PDF のデフォルト値が正しいこと", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.outputPDF).toEqual(DEFAULT_CONVERT_OUTPUT_PDF)
    })

    test("outputFormat の初期値は空文字であること", () => {
      const { result } = renderHook(() => useBookConvert())
      const values = result.current.form.getValues()
      expect(values.outputFormat).toBe("")
    })
  })

  // ============================================================
  // handleConvert
  // ============================================================
  describe("handleConvert", () => {
    test("outputFormat が空の場合は convert が呼ばれないこと", async () => {
      const { result } = renderHook(() => useBookConvert())

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(mockConvert).not.toHaveBeenCalled()
    })

    test("変換成功時に convertStatus が success になること", async () => {
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

    test("変換中は convertStatus が converting になること", async () => {
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

    test("変換失敗時に convertStatus が error になること", async () => {
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

    test("非Errorオブジェクトの例外でも errorMessage が設定されること", async () => {
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
    test("handleReset で全状態がリセットされること", async () => {
      mockConvert.mockResolvedValue(undefined)
      const { result } = renderHook(() => useBookConvert())

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

    test("handleReset で全オプションがデフォルト値に戻ること", async () => {
      const { result } = renderHook(() => useBookConvert())

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
  describe("変換オプション設定", () => {
    test("Look & Feel - マージン設定を変更できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("lookAndFeel.marginTop", 10)
        result.current.form.setValue("lookAndFeel.marginBottom", 10)
      })

      const values = result.current.form.getValues()
      expect(values.lookAndFeel.marginTop).toBe(10)
      expect(values.lookAndFeel.marginBottom).toBe(10)
    })

    test("Look & Feel - テキスト揃えを設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("lookAndFeel.textJustification", "justify")
      })

      expect(result.current.form.getValues().lookAndFeel.textJustification).toBe("justify")
    })

    test("Heuristics - 有効化フラグを切り替えられること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("heuristics.enabled", true)
      })

      expect(result.current.form.getValues().heuristics.enabled).toBe(true)
    })

    test("Structure - 章区切りマークを設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("structureDetection.chapterMark", "rule")
      })

      expect(result.current.form.getValues().structureDetection.chapterMark).toBe("rule")
    })

    test("TOC - 最大リンク数を設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("toc.maxTOCLinks", 100)
      })

      expect(result.current.form.getValues().toc.maxTOCLinks).toBe(100)
    })

    test("Output EPUB - バージョンを設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputEPUB.epubVersion", "2")
      })

      expect(result.current.form.getValues().outputEPUB.epubVersion).toBe("2")
    })

    test("Output PDF - 用紙サイズを設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputPDF.paperSize", "letter")
      })

      expect(result.current.form.getValues().outputPDF.paperSize).toBe("letter")
    })

    test("Output MOBI - ファイルタイプを設定できること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.form.setValue("outputMOBI.mobiFileType", "both")
      })

      expect(result.current.form.getValues().outputMOBI.mobiFileType).toBe("both")
    })
  })

  // ============================================================
  // ストアデータアクセス
  // ============================================================
  describe("store データアクセス", () => {
    test("selectedBook と selectedLibrary が返されること", () => {
      const { result } = renderHook(() => useBookConvert())

      expect(result.current.selectedBook).toBe(mockSelectedBook)
      expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
    })
  })
})
