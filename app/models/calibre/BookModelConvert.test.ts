import { afterEach, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"

// Mock delay so that the polling loop doesn't actually wait
mock.module("@/utils/delay", () => ({ delay: jest.fn().mockResolvedValue(undefined) }))

const mockCheckBookConverting = jest.fn()
const mockGetLibraryInformation = jest.fn()

mock.module("@/services/api", () => ({
  api: {
    CheckBookConverting: mockCheckBookConverting,
    getLibraryInformation: mockGetLibraryInformation,
    getConversionStatus: jest.fn(),
  },
}))

let BookModel: typeof import("./BookModel").BookModel

beforeAll(async () => {
  ;({ BookModel } = await import("./BookModel"))
})

const createManifest = (overrides: Record<string, unknown> = {}) => ({
  kind: "ok" as const,
  data: {
    version: 1,
    toc: { children: [] },
    book_format: "EPUB",
    spine: ["text/part0000.xhtml"],
    link_uid: "uid",
    book_hash: { size: 100, mtime: 999, hash: "abc" },
    is_comic: false,
    raster_cover_name: "cover.jpg",
    title_page_name: "titlepage.xhtml",
    has_maths: false,
    total_length: 1000,
    spine_length: 900,
    toc_anchor_map: {},
    landmarks: [],
    link_to_map: {},
    page_progression_direction: "ltr",
    files: {},
    metadata: {} as never,
    last_read_positions: [],
    annotations_map: null,
    ...overrides,
  },
})

const createBookTree = (imgPaths: string[]) => ({
  kind: "ok" as const,
  data: {
    version: 1,
    tree: {
      n: "html",
      a: [],
      c: [
        { n: "head", a: [], c: [] },
        {
          n: "body",
          a: [],
          c: imgPaths.map((p) => ({
            n: "img",
            a: [
              ["src", p],
              ["data-calibre-src", p],
            ],
            c: [],
          })),
        },
      ],
    },
    ns_map: [],
  },
})

const createBook = () =>
  BookModel.create({
    id: 1,
    metaData: {
      title: "Test",
      authors: [],
      formats: ["EPUB"],
      formatSizes: { EPUB: 100 },
      tags: [],
      rating: 0,
      size: 100,
      comments: "",
      publisher: "",
      seriesIndex: null,
      timestamp: "",
      pubdate: "",
      sort: "",
      authorSort: "",
      uuid: "",
      cover: "",
      series: "",
      lastModified: "",
      selectedFormat: "EPUB",
      identifiers: {},
    },
    path: [],
    hash: null,
    pageProgressionDirection: null,
  })

describe("BookModel.convert", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("AZW3 pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "AZW3",
        spine: ["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"],
      }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"])
  })

  test("KF8:joint pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "KF8:joint", spine: ["xhtml/main.xhtml"] }),
    )
    const book = createBook()

    await book.convert("MOBI", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/main.xhtml"])
  })

  test("is_comic=true (CBZ/CBR/CB7) extracts images using files metadata", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: "cover.jpg",
        total_length: 3,
        files: {
          "cover.jpg": {
            is_virtualized: false,
            size: 150000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page001.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page002.jpg": {
            is_virtualized: false,
            size: 130000,
            mimetype: "image/jpeg",
            is_html: false,
          },
        },
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    // Should use files metadata, not DOM parsing
    expect(book.path.slice()).toEqual(["cover.jpg", "page001.jpg", "page002.jpg"])
    // Verify CBZ metadata is passed to onPostConvert
    expect(receivedComicMetadata).toEqual({
      isComic: true,
      rasterCoverName: "cover.jpg",
      totalLength: 3,
      fileMetadata: {
        "cover.jpg": {
          is_virtualized: false,
          size: 150000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "page001.jpg": {
          is_virtualized: false,
          size: 120000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "page002.jpg": {
          is_virtualized: false,
          size: 130000,
          mimetype: "image/jpeg",
          is_html: false,
        },
      },
    })
  })

  test("CBZ passes metadata to onPostConvert even when files is empty", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: null,
        total_length: 0,
        files: {},
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(receivedComicMetadata).toEqual({
      isComic: true,
      rasterCoverName: null,
      totalLength: 0,
      fileMetadata: {},
    })
  })

  test("CBZ natural sorting works without raster_cover_name", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: null,
        total_length: 3,
        files: {
          "page10.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page2.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page1.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
        },
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(book.path.slice()).toEqual(["page1.jpg", "page2.jpg", "page10.jpg"])
    expect(receivedComicMetadata).toHaveProperty("isComic", true)
  })

  test("MOBI (old, non-KF8) pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "MOBI",
        is_comic: false,
        spine: ["content.html", "content-2.html"],
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("MOBI", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(book.path.slice()).toEqual(["content.html", "content-2.html"])
    // MOBI is not a comic, so no metadata is passed
    expect(receivedComicMetadata).toBeUndefined()
  })

  test("FB2 pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "FB2", is_comic: false, spine: ["book.xhtml"] }),
    )
    const book = createBook()

    await book.convert("FB2", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["book.xhtml"])
  })

  test("DOCX pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "DOCX", is_comic: false, spine: ["book.xhtml"] }),
    )
    const book = createBook()

    await book.convert("DOCX", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["book.xhtml"])
  })

  test("TXT pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "TXT", is_comic: false, spine: ["index.html"] }),
    )
    const book = createBook()

    await book.convert("TXT", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["index.html"])
  })
})
