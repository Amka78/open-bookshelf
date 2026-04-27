import { ApiCalibreInterfaceType, api } from "@/services/api"
import initializeData from "@/services/api/mock/interfacedata-update.json"
import { getSnapshot } from "mobx-state-tree"
import { CalibreRootStore } from "./CalibreRootStore"
describe("CalibreRootStore test", () => {
  beforeAll(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test("Successful execution of Initialize", () => {
    const resp = {
      kind: "ok",
      data: initializeData,
    }
    const mockInitializeCalibre = jest.spyOn(api, "initializeCalibre")
    mockInitializeCalibre.mockResolvedValue(
      resp as Awaited<ReturnType<typeof api.initializeCalibre>>,
    )
    const model = CalibreRootStore.create({})

    return model.initialize().then((result) => {
      expect(result).toBeTruthy()

      expect(model.numPerPage).toBe(50)
      expect(model.defaultLibraryId).toBe("calibre")

      expect(model.readingHistories).toHaveLength(2)

      expect(model.readingHistories[0].libraryId).toBe("test1")
      expect(model.readingHistories[0].bookId).toBe(35)
      expect(model.readingHistories[0].format).toBe("CBZ")
      expect(model.readingHistories[0].currentPage).toBe(0)
      expect(model.readingHistories[0].bookId).toBe(35)
      expect(model.libraryMap.has("test1")).toBeTruthy()
      expect(model.libraryMap.has("test2")).toBeTruthy()
    })
  })

  test("bumpBookThumbnailRevision increments revision per library and book", () => {
    const model = CalibreRootStore.create({})

    expect(model.getBookThumbnailRevision("main", 42)).toBe(0)

    model.bumpBookThumbnailRevision("main", 42)
    expect(model.getBookThumbnailRevision("main", 42)).toBe(1)

    model.bumpBookThumbnailRevision("main", 42)
    expect(model.getBookThumbnailRevision("main", 42)).toBe(2)
    expect(model.getBookThumbnailRevision("main", 7)).toBe(0)
  })

  test("searchLibrary loads custom column values into customColumns map", async () => {
    const initResp = { kind: "ok" as const, data: initializeData }
    jest
      .spyOn(api, "initializeCalibre")
      .mockResolvedValue(initResp as Awaited<ReturnType<typeof api.initializeCalibre>>)

    const model = CalibreRootStore.create({})
    await model.initialize()
    model.setLibrary("test1")

    const libraryResp = {
      kind: "ok" as const,
      data: {
        book_display_fields: [],
        bools_are_tristate: true,
        field_metadata: {},
        virtual_libraries: {},
        fts_enabled: false,
        library_id: "test1",
        sortable_fields: [],
        search_result: {
          total_num: 1,
          sort_order: "desc",
          num_book_without_search: 1,
          offset: 0,
          num: 1,
          sort: "timestamp",
          base_url: "",
          query: "",
          library_id: "test1",
          book_ids: [1],
          vl: "",
        },
        metadata: {
          1: {
            authors: ["Test Author"],
            author_sort: "Author, Test",
            formats: ["EPUB"],
            last_modified: "2024-01-01T00:00:00+00:00",
            series: null,
            series_index: null,
            "#fixed": null,
            "#my_genre": "Science Fiction",
            "#is_read": true,
            size: 1000,
            sort: "test book",
            tags: [],
            timestamp: "2024-01-01T00:00:00+00:00",
            title: "Test Book",
            uuid: "test-uuid-001",
            rating: 0,
            languages: [],
            lang_names: {},
            format_sizes: {},
            publisher: null,
            pubdate: null,
            comments: null,
            identifiers: {},
          },
        },
      },
    }

    jest
      .spyOn(api, "getLibrary")
      .mockResolvedValue(libraryResp as Awaited<ReturnType<typeof api.getLibrary>>)

    const result = await model.searchLibrary()
    expect(result).toBe(true)

    const book = model.selectedLibrary.books.get("1")
    expect(book).toBeDefined()
    expect(book!.metaData.customColumns.get("#myGenre")).toBe("Science Fiction")
    expect(book!.metaData.customColumns.get("#isRead")).toBe(true)
    // #fixed must NOT be in customColumns (handled separately as sharpFixed)
    expect(book!.metaData.customColumns.has("#fixed")).toBe(false)
    expect(book!.metaData.sharpFixed).toBeNull()
  })
})
