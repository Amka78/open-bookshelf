import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"

const mockSaveAnnotations = jest.fn().mockResolvedValue({ kind: "ok" })
const mockUseStores = jest.fn()

mock.module("@/services/api", () => ({
  api: {
    saveAnnotations: mockSaveAnnotations,
  },
}))

mock.module("@/models", () => ({
  useStores: mockUseStores,
}))

let useAnnotations: typeof import("./useAnnotations").useAnnotations

beforeAll(async () => {
  ;({ useAnnotations } = await import("./useAnnotations"))
})

const makeAnnotation = (overrides = {}) => ({
  uuid: "uuid-1",
  type: "bookmark" as const,
  spineIndex: 2,
  spineName: "page2.xhtml",
  startCfi: null,
  endCfi: null,
  highlightedText: null,
  notes: null,
  styleKind: null,
  styleWhich: null,
  timestamp: "2024-01-01T00:00:00.000Z",
  title: "Page 3",
  posFrac: 0.2,
  setNotes: jest.fn(),
  setTitle: jest.fn(),
  ...overrides,
})

const makeHighlightAnnotation = (overrides = {}) =>
  makeAnnotation({
    uuid: "uuid-h1",
    type: "highlight" as const,
    spineIndex: 1,
    spineName: "page1.xhtml",
    highlightedText: "some text",
    styleKind: "color",
    styleWhich: "yellow",
    title: null,
    ...overrides,
  })

const makeStore = (annotations: ReturnType<typeof makeAnnotation>[]) => {
  const mockSetAnnotations = jest.fn()
  return {
    calibreRootStore: {
      selectedLibrary: {
        id: "Calibre_Library",
        selectedBook: {
          id: 42,
          path: ["page0.xhtml", "page1.xhtml", "page2.xhtml", "page3.xhtml", "page4.xhtml"],
          metaData: { selectedFormat: "AZW3" },
          annotations,
          setAnnotations: mockSetAnnotations,
        },
      },
    },
  }
}

describe("useAnnotations", () => {
  beforeEach(() => {
    mockSaveAnnotations.mockClear()
    mockSaveAnnotations.mockResolvedValue({ kind: "ok" })
  })

  test("addBookmark calls saveAnnotations with correct payload", async () => {
    const store = makeStore([])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    let ok: boolean = false
    await act(async () => {
      ok = await result.current.addBookmark(2, "My bookmark")
    })
    expect(ok).toBe(true)
    expect(mockSaveAnnotations).toHaveBeenCalledTimes(1)
    const [libraryId, bookId, format, annotations] = mockSaveAnnotations.mock.calls[0]
    expect(libraryId).toBe("Calibre_Library")
    expect(bookId).toBe(42)
    expect(format).toBe("AZW3")
    expect(annotations).toHaveLength(1)
    expect(annotations[0].type).toBe("bookmark")
    expect(annotations[0].spine_index).toBe(2)
    expect(annotations[0].title).toBe("My bookmark")
    expect(annotations[0].removed).toBeUndefined()
  })

  test("addBookmark uses default title when none given", async () => {
    const store = makeStore([])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    await act(async () => {
      await result.current.addBookmark(0)
    })
    const [, , , annotations] = mockSaveAnnotations.mock.calls[0]
    expect(annotations[0].title).toBe("Page 1")
  })

  test("addHighlight creates correct annotation", async () => {
    const store = makeStore([])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    await act(async () => {
      await result.current.addHighlight(1, "some text", "my note", "green")
    })
    const [, , , annotations] = mockSaveAnnotations.mock.calls[0]
    expect(annotations[0].type).toBe("highlight")
    expect(annotations[0].highlighted_text).toBe("some text")
    expect(annotations[0].notes).toBe("my note")
    expect(annotations[0].style).toEqual({ kind: "color", which: "green" })
    expect(annotations[0].spine_index).toBe(1)
  })

  test("deleteAnnotation sends removed: true", async () => {
    const existing = makeAnnotation({ uuid: "uuid-1" })
    const store = makeStore([existing])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    let ok: boolean = false
    await act(async () => {
      ok = await result.current.deleteAnnotation("uuid-1")
    })
    expect(ok).toBe(true)
    const [, , , annotations] = mockSaveAnnotations.mock.calls[0]
    const removed = annotations.find((a: { uuid: string }) => a.uuid === "uuid-1")
    expect(removed?.removed).toBe(true)
  })

  test("deleteAnnotation returns false when uuid not found", async () => {
    const store = makeStore([])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    let ok: boolean = true
    await act(async () => {
      ok = await result.current.deleteAnnotation("nonexistent-uuid")
    })
    expect(ok).toBe(false)
    expect(mockSaveAnnotations).not.toHaveBeenCalled()
  })

  test("annotationsForPage filters by spineIndex", () => {
    const ann1 = makeAnnotation({ uuid: "a1", spineIndex: 1 })
    const ann2 = makeAnnotation({ uuid: "a2", spineIndex: 2 })
    const ann3 = makeAnnotation({ uuid: "a3", spineIndex: 1 })
    const store = makeStore([ann1, ann2, ann3])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    const page1Annotations = result.current.annotationsForPage(1)
    expect(page1Annotations).toHaveLength(2)
    expect(page1Annotations.map((a) => a.uuid)).toEqual(["a1", "a3"])
  })

  test("addBookmark returns false when no book selected", async () => {
    mockUseStores.mockReturnValue({
      calibreRootStore: { selectedLibrary: null },
    })
    const { result } = renderHook(() => useAnnotations())
    let ok: boolean = true
    await act(async () => {
      ok = await result.current.addBookmark(0)
    })
    expect(ok).toBe(false)
    expect(mockSaveAnnotations).not.toHaveBeenCalled()
  })

  test("addBookmark returns false when api fails", async () => {
    const store = makeStore([])
    mockUseStores.mockReturnValue(store)
    mockSaveAnnotations.mockResolvedValue({ kind: "server" })
    const { result } = renderHook(() => useAnnotations())
    let ok: boolean = true
    await act(async () => {
      ok = await result.current.addBookmark(0)
    })
    expect(ok).toBe(false)
  })

  test("annotations array is empty when no book", () => {
    mockUseStores.mockReturnValue({
      calibreRootStore: { selectedLibrary: null },
    })
    const { result } = renderHook(() => useAnnotations())
    expect(result.current.annotations).toEqual([])
  })

  test("existing annotations are preserved when adding new bookmark", async () => {
    const existing = makeAnnotation({ uuid: "existing-1" })
    const store = makeStore([existing])
    mockUseStores.mockReturnValue(store)
    const { result } = renderHook(() => useAnnotations())
    await act(async () => {
      await result.current.addBookmark(3)
    })
    const [, , , annotations] = mockSaveAnnotations.mock.calls[0]
    expect(annotations).toHaveLength(2)
    expect(annotations.find((a: { uuid: string }) => a.uuid === "existing-1")).toBeTruthy()
  })
})
