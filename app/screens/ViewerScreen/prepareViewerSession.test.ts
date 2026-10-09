import { vi, afterEach, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
import * as bookImageCache from "@/utils/bookImageCache"
import * as network from "@/utils/network"
import { ReadingHistoryModel } from "@/models/calibre"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let prepareViewerSession: typeof import("./prepareViewerSession").prepareViewerSession

beforeAll(async () => {
  ;({ prepareViewerSession } = await import("./prepareViewerSession"))
})

describe("prepareViewerSession", () => {
  const createBook = (
    overrides: Partial<{
      id: number
      hash: number
      path: string[]
      convert: (...args: unknown[]) => Promise<void>
      metaData: {
        formats: string[]
        formatSizes: Map<string, number>
        setProp: (key: string, value: string) => void
      }
      manifestServerPosFrac: number | null
      manifestServerEpoch: number | null
    }> = {},
  ) => ({
    id: 1,
    hash: 101,
    path: ["page-1.jpg", "page-2.jpg"],
    convert: vi.fn(async (_format, _libraryId, callback: () => Promise<void>) => {
      await callback()
    }),
    metaData: {
      formats: ["EPUB"],
      formatSizes: new Map([
        ["EPUB", 100],
        ["PDF", 100],
        ["MOBI", 100],
      ]),
      setProp: vi.fn(),
    },
    manifestServerPosFrac: null,
    manifestServerEpoch: null,
    ...overrides,
  })

  const createStores = ({
    selectedBook,
    readingHistories = [],
    addReadingHistory = vi.fn(),
  }: {
    selectedBook: ReturnType<typeof createBook>
    readingHistories?: Array<Record<string, unknown>>
    addReadingHistory?: ReturnType<typeof vi.fn>
  }) => ({
    calibreRootStore: {
      libraryMap: new Map([["library-1", true]]),
      setLibrary: vi.fn(),
      selectedLibrary: {
        id: "library-1",
        selectedBook,
        setBook: vi.fn(),
      },
      readingHistories,
      addReadingHistory,
    },
    settingStore: {
      api: {
        baseUrl: "https://server.example",
      },
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("creates cached PDF history when opening a PDF", async () => {
    const selectedBook = createBook({
      metaData: {
        formats: ["PDF"],
        formatSizes: new Map([["PDF", 100]]),
        setProp: vi.fn(),
      },
    })
    const addReadingHistory = vi.fn()
    const stores = createStores({ selectedBook, addReadingHistory })

    vi.spyOn(bookImageCache, "cacheBookFile").mockResolvedValue("file:///cache/book.pdf")
    vi.spyOn(ReadingHistoryModel, "create").mockReturnValue({ history: true } as never)

    await prepareViewerSession({
      request: {
        bookId: 1,
        libraryId: "library-1",
        format: "PDF",
      },
      ...stores,
    })

    expect(selectedBook.metaData.setProp).toHaveBeenCalledWith("selectedFormat", "PDF")
    expect(bookImageCache.cacheBookFile).toHaveBeenCalled()
    expect(addReadingHistory).toHaveBeenCalledWith({ history: true })
  })

  test("verifies existing cached images before opening", async () => {
    const selectedBook = createBook()
    const setCacheVerified = vi.fn()
    const stores = createStores({
      selectedBook,
      readingHistories: [
        {
          libraryId: "library-1",
          bookId: 1,
          format: "EPUB",
          cachedPath: ["file:///cache/page-1.jpg", "file:///cache/page-2.jpg"],
          setCacheVerified,
        },
      ],
    })

    const onProgress = vi.fn()
    vi.spyOn(bookImageCache, "verifyCachedBookImages").mockResolvedValue({
      allExist: true,
      missingIndices: [],
    })

    await prepareViewerSession({
      request: {
        bookId: 1,
        libraryId: "library-1",
        format: "EPUB",
      },
      ...stores,
      onProgress,
    })

    expect(onProgress).toHaveBeenCalledWith("viewerPreparation.verifyingCache")
    expect(setCacheVerified).toHaveBeenCalledWith(true)
  })

  test("converts and caches image pages when history does not exist", async () => {
    const selectedBook = createBook()
    const addReadingHistory = vi.fn()
    const stores = createStores({ selectedBook, addReadingHistory })

    vi
      .spyOn(bookImageCache, "cacheBookImages")
      .mockResolvedValue(["file:///cache/page-1.jpg", "file:///cache/page-2.jpg"])
    vi.spyOn(ReadingHistoryModel, "create").mockReturnValue({ history: true } as never)

    await prepareViewerSession({
      request: {
        bookId: 1,
        libraryId: "library-1",
        format: "EPUB",
      },
      ...stores,
    })

    expect(selectedBook.convert).toHaveBeenCalled()
    expect(bookImageCache.cacheBookImages).toHaveBeenCalled()
    expect(addReadingHistory).toHaveBeenCalledWith({ history: true })
  })

  test("throws when an uncached image-based book is opened offline", async () => {
    const selectedBook = createBook()
    const stores = createStores({
      selectedBook,
      readingHistories: [
        {
          libraryId: "library-1",
          bookId: 1,
          format: "EPUB",
          cachedPath: [],
          bookHash: 101,
          setCachePath: vi.fn(),
          setCacheVerified: vi.fn(),
        },
      ],
    })

    vi.spyOn(network, "isNetworkAvailable").mockResolvedValue(false)

    await expect(
      prepareViewerSession({
        request: {
          bookId: 1,
          libraryId: "library-1",
          format: "EPUB",
        },
        ...stores,
      }),
    ).rejects.toThrow("This book is not cached and you are offline")
  })

  test("does not cache XHTML paths for text formats", async () => {
    const selectedBook = createBook({
      path: [],
      convert: vi.fn(async (_format, _libraryId, callback: () => Promise<void>) => {
        selectedBook.path = ["index.xhtml", "chapter-1.xhtml"]
        await callback()
      }),
    })
    const addReadingHistory = vi.fn()
    const stores = createStores({ selectedBook, addReadingHistory })
    const cacheBookImagesSpy = vi.spyOn(bookImageCache, "cacheBookImages")
    vi.spyOn(ReadingHistoryModel, "create").mockReturnValue({ history: true } as never)

    await prepareViewerSession({
      request: {
        bookId: 1,
        libraryId: "library-1",
        format: "MOBI",
      },
      ...stores,
    })

    expect(selectedBook.convert).toHaveBeenCalled()
    expect(cacheBookImagesSpy).not.toHaveBeenCalled()
    expect(addReadingHistory).toHaveBeenCalledWith({ history: true })
  })
})
