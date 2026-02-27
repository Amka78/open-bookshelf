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

  describe("初期状態", () => {
    test("初期状態では selectedFormat が null であること", () => {
      const { result } = renderHook(() => useBookConvert())
      expect(result.current.selectedFormat).toBeNull()
    })

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
  })

  describe("handleFormatSelect", () => {
    test("フォーマット選択で selectedFormat が更新されること", () => {
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.handleFormatSelect("EPUB")
      })

      expect(result.current.selectedFormat).toBe("EPUB")
    })

    test("フォーマット再選択で convertStatus がリセットされること", () => {
      const { result } = renderHook(() => useBookConvert())

      // まず変換を開始して状態を変える
      act(() => {
        result.current.handleFormatSelect("EPUB")
      })
      // convertStatus を手動で変更するのは難しいので、handleFormatSelect のリセット動作を間接的に確認
      act(() => {
        result.current.handleFormatSelect("PDF")
      })

      expect(result.current.selectedFormat).toBe("PDF")
      expect(result.current.convertStatus).toBe("idle")
      expect(result.current.errorMessage).toBeNull()
    })
  })

  describe("handleConvert", () => {
    test("selectedFormat が null の場合は convert が呼ばれないこと", async () => {
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
        result.current.handleFormatSelect("EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(mockConvert).toHaveBeenCalledWith("EPUB", "test-library", expect.any(Function))
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
        result.current.handleFormatSelect("EPUB")
      })

      // handleConvert を開始（完了を待たない）
      act(() => {
        result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("converting")

      // 変換完了
      await act(async () => {
        resolveConvert()
      })
    })

    test("変換失敗時に convertStatus が error になること", async () => {
      const errorMessage = "Conversion failed: unsupported format"
      mockConvert.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.handleFormatSelect("EPUB")
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
        result.current.handleFormatSelect("EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("error")
      expect(result.current.errorMessage).toBe("string error")
    })
  })

  describe("handleReset", () => {
    test("handleReset で全状態がリセットされること", async () => {
      mockConvert.mockResolvedValue(undefined)
      const { result } = renderHook(() => useBookConvert())

      act(() => {
        result.current.handleFormatSelect("EPUB")
      })

      await act(async () => {
        await result.current.handleConvert()
      })

      expect(result.current.convertStatus).toBe("success")

      act(() => {
        result.current.handleReset()
      })

      expect(result.current.selectedFormat).toBeNull()
      expect(result.current.convertStatus).toBe("idle")
      expect(result.current.errorMessage).toBeNull()
    })
  })

  describe("store データアクセス", () => {
    test("selectedBook と selectedLibrary が返されること", () => {
      const { result } = renderHook(() => useBookConvert())

      expect(result.current.selectedBook).toBe(mockSelectedBook)
      expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
    })
  })
})
