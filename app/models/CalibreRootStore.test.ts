import { ApiCalibreInterfaceType, api } from "@/services/api"
import initializeData from "@/services/api/mock/interfacedata-update.json"
import { getSnapshot } from "mobx-state-tree"
import { CalibreRootStore } from "./CalibreRootStore"
import { RootStoreModel } from "./RootStore"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function buildTagBrowserResponse() {
  return {
    kind: "ok" as const,
    data: {
      root: {
        id: "root",
        children: [
          {
            id: "cat1",
            children: [],
          },
        ],
      },
      item_map: {
        cat1: {
          category: "authors",
          name: "Authors",
          is_category: true,
          count: 5,
          tooltip: "",
          is_editable: true,
          is_searchable: true,
        },
      },
    },
  }
}

function buildBookInfoResponse(query: string) {
  return {
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
        query: query,
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
}

describe("CalibreRootStore test", () => {
  beforeAll(() => {
    vi.useRealTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test("Successful execution of Initialize", () => {
    const resp = {
      kind: "ok",
      data: initializeData,
    }
    const mockInitializeCalibre = vi.spyOn(api, "initializeCalibre")
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
    vi.spyOn(api, "initializeCalibre").mockResolvedValue(
      initResp as Awaited<ReturnType<typeof api.initializeCalibre>>,
    )

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

    vi.spyOn(api, "getLibrary").mockResolvedValue(
      libraryResp as Awaited<ReturnType<typeof api.getLibrary>>,
    )

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

  test("stale searchLibrary response must not overwrite a newer search", async () => {
    vi.spyOn(api, "initializeCalibre").mockResolvedValue({
      kind: "ok" as const,
      data: initializeData,
    } as Awaited<ReturnType<typeof api.initializeCalibre>>)

    const model = CalibreRootStore.create({})
    await model.initialize()
    model.setLibrary("test1")

    // 初期データの library には searchSetting が無いため生成する
    if (!model.selectedLibrary.searchSetting) {
      model.selectedLibrary.setProp("searchSetting", {
        offset: 0,
        query: "",
        sort: "timestamp",
        sortOrder: "desc",
        totalNum: 0,
        vl: null,
      })
    }

    // getLibrary を呼び出しごとに制御可能な deferred で返し、レスポンス到着順を入れ替えられるようにする
    const pending = new Map<
      string,
      ReturnType<typeof deferred<Awaited<ReturnType<typeof api.getLibrary>>>>
    >()
    vi.spyOn(api, "getLibrary").mockImplementation(async (_libraryId, searchText) => {
      const q = searchText ?? ""
      const d = deferred<Awaited<ReturnType<typeof api.getLibrary>>>()
      pending.set(q, d)
      return d.promise
    })

    // 1. 絞込検索（LeftSideMenu 相当）: クエリ "authors:=Tolkien"
    model.selectedLibrary.searchSetting.setProp("query", "authors:=Tolkien")
    const filterSearch = model.searchLibrary()

    // 2. 直後にクリア検索: クエリ ""
    model.selectedLibrary.searchSetting.setProp("query", "")
    const clearSearch = model.searchLibrary()

    // クリア検索のレスポンスが先に到着し、古い絞込検索のレスポンスが後に到着する順序で返す
    pending
      .get("")
      ?.resolve(buildBookInfoResponse("") as Awaited<ReturnType<typeof api.getLibrary>>)
    pending
      .get("authors:=Tolkien")
      ?.resolve(
        buildBookInfoResponse("authors:=Tolkien") as Awaited<ReturnType<typeof api.getLibrary>>,
      )

    await Promise.all([filterSearch, clearSearch])

    // 最後に実行された操作（クリア）が勝ち、古い絞込レスポンスは上書きしない
    expect(model.selectedLibrary.searchSetting.query).toBe("")
    expect(model.selectedLibrary.books.has("1")).toBe(true)
  })

  test("markTagBrowserDirty は dirty を立て、getTagBrowser 成功で消費する", async () => {
    vi.spyOn(api, "initializeCalibre").mockResolvedValue({
      kind: "ok" as const,
      data: initializeData,
    } as Awaited<ReturnType<typeof api.initializeCalibre>>)

    const rootStore = RootStoreModel.create({})
    const model = rootStore.calibreRootStore
    await model.initialize()
    model.setLibrary("test1")

    expect(model.tagBrowserDirty).toBe(false)

    model.markTagBrowserDirty()
    expect(model.tagBrowserDirty).toBe(true)

    vi.spyOn(api, "getTagBrowser").mockResolvedValue(
      buildTagBrowserResponse() as Awaited<ReturnType<typeof api.getTagBrowser>>,
    )

    const result = await model.getTagBrowser()
    expect(result).toBe(true)
    expect(model.tagBrowserDirty).toBe(false)
    expect(model.tagBrowserFetching).toBe(false)
    expect(model.tagBrowserPending).toBe(false)
    expect(model.selectedLibrary.tagBrowser).toHaveLength(1)
  })

  test("getTagBrowser は取得中の再要求をガードし pending で後回しにする", async () => {
    vi.spyOn(api, "initializeCalibre").mockResolvedValue({
      kind: "ok" as const,
      data: initializeData,
    } as Awaited<ReturnType<typeof api.initializeCalibre>>)

    const rootStore = RootStoreModel.create({})
    const model = rootStore.calibreRootStore
    await model.initialize()
    model.setLibrary("test1")

    let resolveFirst!: (v: Awaited<ReturnType<typeof api.getTagBrowser>>) => void
    const getTagBrowserSpy = vi.spyOn(api, "getTagBrowser").mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof api.getTagBrowser>>>((res) => {
          resolveFirst = res
        }),
    )

    const first = model.getTagBrowser()
    expect(model.tagBrowserFetching).toBe(true)

    // 取得中の再要求はネットワークに行かず false を返し、pending を立てる
    const second = await model.getTagBrowser()
    expect(second).toBe(false)
    expect(model.tagBrowserPending).toBe(true)
    expect(getTagBrowserSpy).toHaveBeenCalledTimes(1)

    resolveFirst(buildTagBrowserResponse() as Awaited<ReturnType<typeof api.getTagBrowser>>)
    const firstResult = await first
    expect(firstResult).toBe(true)
    expect(model.tagBrowserFetching).toBe(false)
    // pending は次に再取得が開始された時点で消費される（useLibrary 側が担う）
    expect(model.tagBrowserPending).toBe(true)
  })

  test("book.update はタグブラウザ件数に影響するフィールドのみ dirty を立てる", async () => {
    vi.spyOn(api, "initializeCalibre").mockResolvedValue({
      kind: "ok" as const,
      data: initializeData,
    } as Awaited<ReturnType<typeof api.initializeCalibre>>)

    const rootStore = RootStoreModel.create({})
    const model = rootStore.calibreRootStore
    await model.initialize()
    model.setLibrary("test1")

    // 初期データの library には searchSetting が無いため生成する
    model.selectedLibrary.setProp("searchSetting", {
      offset: 0,
      query: "",
      sort: "timestamp",
      sortOrder: "desc",
      totalNum: 0,
      vl: null,
    })

    vi.spyOn(api, "getLibrary").mockResolvedValue(
      buildBookInfoResponse("") as Awaited<ReturnType<typeof api.getLibrary>>,
    )
    await model.searchLibrary()

    const book = model.selectedLibrary.books.get("1")
    expect(book).toBeDefined()

    vi.spyOn(api, "editBook").mockResolvedValue({
      kind: "ok",
    } as Awaited<ReturnType<typeof api.editBook>>)

    // title はカテゴリ件数と無関係 → dirty にならない
    const titleResult = await book!.update(model.selectedLibrary.id, { title: "Renamed" }, [
      "title",
    ])
    expect(titleResult).toBe(true)
    expect(model.tagBrowserDirty).toBe(false)

    // tags はタグブラウザのカテゴリに映る → dirty になる
    const tagsResult = await book!.update(model.selectedLibrary.id, { tags: ["new-tag"] }, ["tags"])
    expect(tagsResult).toBe(true)
    expect(model.tagBrowserDirty).toBe(true)
  })
})
