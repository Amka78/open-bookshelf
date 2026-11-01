import { MetadataModel, type Book } from "@/models/calibre"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { useBulkEditForm } from "./useBulkEditForm"

function createMetadata(title = "Book") {
  return MetadataModel.create({
    sharpFixed: null,
    authorSort: null,
    authors: ["Author"],
    formats: ["EPUB"],
    lastModified: null,
    series: null,
    seriesIndex: null,
    size: 100,
    sort: null,
    tags: [],
    timestamp: null,
    title,
    uuid: "uuid",
    selectedFormat: null,
    rating: null,
    languages: ["en"],
    langNames: { en: "English" },
    formatSizes: { EPUB: 100 },
    cover: undefined,
  })
}

function createBook(title = "Book") {
  return {
    id: 1,
    metaData: createMetadata(title),
    update: vi.fn(),
  } as unknown as Book
}

describe("useBulkEditForm", () => {
  test("submits only the edited fields to every selected book", async () => {
    const books = [createBook(), createBook()]
    const onSaved = vi.fn()
    const { result } = renderHook(() => useBulkEditForm({ books, libraryId: "library-1", onSaved }))

    act(() => {
      result.current.form.setValue("title", "Updated", { shouldDirty: true })
    })

    expect(result.current.canSave).toBe(true)

    await act(async () => {
      await result.current.submit()
    })

    for (const book of books) {
      expect(book.update).toHaveBeenCalledWith(
        "library-1",
        expect.objectContaining({ title: "Updated" }),
        ["title"],
      )
    }
    expect(onSaved).toHaveBeenCalledTimes(1)
  })

  test("does not save when no field was edited", async () => {
    const book = createBook()
    const onSaved = vi.fn()
    const { result } = renderHook(() =>
      useBulkEditForm({ books: [book], libraryId: "library-1", onSaved }),
    )

    expect(result.current.canSave).toBe(false)

    await act(async () => {
      await result.current.submit()
    })

    expect(book.update).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
  })
})
