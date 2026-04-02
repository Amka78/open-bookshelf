import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import {
  describe as baseDescribe,
  test as baseTest,
} from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()

mock.module("@/models", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("/home/amka78/private/open-bookshelf/app/models/index.ts", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("@/services/api", () => ({
  api: {
    getInlineBookUrl: jest.fn(() => "http://calibre-test/book.pdf"),
    getAuthHeaders: jest.fn(() => ({ Authorization: "Digest token-xyz" })),
  },
}))

mock.module("/home/amka78/private/open-bookshelf/app/services/api/index.ts", () => ({
  api: {
    getInlineBookUrl: jest.fn(() => "http://calibre-test/book.pdf"),
    getAuthHeaders: jest.fn(() => ({ Authorization: "Digest token-xyz" })),
  },
}))

let usePDFViewer: typeof import("./usePDFViewer").usePDFViewer

beforeAll(async () => {
  ;({ usePDFViewer } = await import("./usePDFViewer"))
})

const mockBook = {
  id: "book-1",
  metaData: { title: "Test PDF Book" },
}

const mockLibrary = {
  id: "lib-1",
  selectedBook: mockBook,
}

function makeMockStore(overrides: { cachedPdfPath?: string } = {}) {
  return {
    authenticationStore: { isAuthenticated: true, token: "token-xyz" },
    calibreRootStore: {
      selectedLibrary: mockLibrary,
      readingHistories: overrides.cachedPdfPath
        ? [
            {
              libraryId: "lib-1",
              bookId: "book-1",
              format: "PDF",
              cachedPath: [overrides.cachedPdfPath],
            },
          ]
        : [],
    },
  }
}

afterAll(() => {
  jest.restoreAllMocks()
})

describe("usePDFViewer", () => {
  beforeEach(() => {
    useStoresMock.mockReturnValue(makeMockStore())
  })

  test("初期状態では totalPages が undefined", () => {
    const { result } = renderHook(() => usePDFViewer())
    expect(result.current.totalPages).toBeUndefined()
  })

  test("setTotalPages を呼ぶと totalPages が更新される", async () => {
    const { result } = renderHook(() => usePDFViewer())

    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 5))
    })

    expect(result.current.totalPages).toBe(5)
  })

  test("Math.max ガードにより totalPages は低い値で上書きされない", async () => {
    const { result } = renderHook(() => usePDFViewer())

    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 5))
    })

    expect(result.current.totalPages).toBe(5)

    // Android が singlePage で再ロードし numberOfPages=1 を報告するケース
    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 1))
    })

    expect(result.current.totalPages).toBe(5)
  })

  test("hidden PDF が先に onLoadComplete(1) を報告しても後から正しい値に更新できる", async () => {
    const { result } = renderHook(() => usePDFViewer())

    // visible PDF が先に singlePage artifact として 1 を報告
    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 1))
    })

    expect(result.current.totalPages).toBe(1)

    // hidden PDF が後から本当のページ数を報告
    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 42))
    })

    expect(result.current.totalPages).toBe(42)
  })

  test("より大きい値で totalPages を更新できる", async () => {
    const { result } = renderHook(() => usePDFViewer())

    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 3))
    })

    expect(result.current.totalPages).toBe(3)

    await act(async () => {
      result.current.setTotalPages((prev) => Math.max(prev ?? 0, 10))
    })

    expect(result.current.totalPages).toBe(10)
  })

  test("selectedBook がない場合は undefined を返す", () => {
    useStoresMock.mockReturnValue({
      authenticationStore: { isAuthenticated: false, token: "" },
      calibreRootStore: {
        selectedLibrary: { id: "lib-1", selectedBook: null },
        readingHistories: [],
      },
    })

    const { result } = renderHook(() => usePDFViewer())
    expect(result.current.selectedBook).toBeNull()
  })

  test("sourceUri は API の URL を返す（web 環境）", () => {
    const { result } = renderHook(() => usePDFViewer())

    expect(result.current.sourceUri).toBe("http://calibre-test/book.pdf")
  })

  test("認証済みの場合、header に sourceUri の認証ヘッダーが設定される", () => {
    const { result } = renderHook(() => usePDFViewer())

    expect(result.current.header).toEqual({ Authorization: "Digest token-xyz" })
  })

  test("未認証の場合、header は undefined", () => {
    useStoresMock.mockReturnValue({
      authenticationStore: { isAuthenticated: false, token: "" },
      calibreRootStore: {
        selectedLibrary: mockLibrary,
        readingHistories: [],
      },
    })

    const { result } = renderHook(() => usePDFViewer())
    expect(result.current.header).toBeUndefined()
  })

  test("calculatePageDimensions: ページ高さがウィンドウより大きい場合は縮小する", () => {
    const { result } = renderHook(() => usePDFViewer())

    const size = { width: 600, height: 900 }
    const dims = result.current.calculatePageDimensions(size, 375, 667, false)

    expect(dims.height).toBeLessThanOrEqual(667)
    expect(dims.width).toBeGreaterThan(0)
  })

  test("calculatePageWidth: 見開きでは半画面いっぱいまで幅を使う", () => {
    const { result } = renderHook(() => usePDFViewer())

    expect(result.current.calculatePageWidth(true, 800)).toBe(400)
  })

  test("calculatePageDimensions: 利用可能な幅に合わせて拡大できる", () => {
    const { result } = renderHook(() => usePDFViewer())

    const size = { width: 300, height: 600 }
    const dims = result.current.calculatePageDimensions(size, 400, 900, true)

    expect(dims.width).toBe(400)
    expect(dims.height).toBe(800)
  })
})
