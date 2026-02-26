import { useOpenViewer } from "./useOpenViewer"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { cacheBookImages } from "@/utils/bookImageCache"
import { ReadingHistoryModel } from "@/models/calibre"

jest.mock("@/models", () => ({
  useStores: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}))

jest.mock("@/utils/bookImageCache", () => ({
  cacheBookImages: jest.fn(),
}))

jest.mock("@/models/calibre", () => ({
  ReadingHistoryModel: {
    create: jest.fn(),
  },
}))

describe("useOpenViewer", () => {
  const createSelectedBook = (overrides?: Partial<any>) => {
    return {
      id: 1,
      hash: 7,
      path: ["/1.png"],
      convert: jest.fn(),
      metaData: {
        formats: ["EPUB"],
        size: 100,
        setProp: jest.fn(),
      },
      ...overrides,
    }
  }

  const setupStore = ({
    selectedBook,
    readingHistories = [],
    addReadingHistory = jest.fn(),
  }: {
    selectedBook: any
    readingHistories?: any[]
    addReadingHistory?: jest.Mock
  }) => {
    ;(useStores as jest.Mock).mockReturnValue({
      authenticationStore: {
        getHeader: jest.fn().mockReturnValue({ Authorization: "Basic token" }),
      },
      settingStore: { api: { baseUrl: "https://base" } },
      calibreRootStore: {
        selectedLibrary: { id: "lib1", selectedBook },
        readingHistories,
        addReadingHistory,
      },
    })

    return { addReadingHistory }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("navigates to PDFViewer for PDF format", async () => {
    const navigate = jest.fn()
    ;(useNavigation as jest.Mock).mockReturnValue({ navigate })

    const selectedBook = createSelectedBook({
      metaData: {
        formats: ["PDF"],
        size: 100,
        setProp: jest.fn(),
      },
    })
    setupStore({ selectedBook })

    const onComplete = jest.fn()
    const { execute } = useOpenViewer()

    await execute({ openModal: jest.fn() } as any, { onComplete })

    expect(selectedBook.metaData.setProp).toHaveBeenCalledWith("selectedFormat", "PDF")
    expect(navigate).toHaveBeenCalledWith("PDFViewer")
    expect(onComplete).toHaveBeenCalledWith({
      route: "PDFViewer",
      format: "PDF",
      bookId: 1,
      libraryId: "lib1",
    })
  })

  test("navigates to Viewer when reading history exists", async () => {
    const navigate = jest.fn()
    ;(useNavigation as jest.Mock).mockReturnValue({ navigate })

    const selectedBook = createSelectedBook({
      id: 2,
      hash: 8,
      path: ["/2.png"],
      metaData: {
        formats: ["EPUB"],
        size: 200,
        setProp: jest.fn(),
      },
    })
    setupStore({
      selectedBook,
      readingHistories: [{ libraryId: "lib1", bookId: 2, format: "EPUB" }],
    })

    const { execute } = useOpenViewer()
    await execute({ openModal: jest.fn() } as any)

    expect(navigate).toHaveBeenCalledWith("Viewer")
    expect(selectedBook.convert).not.toHaveBeenCalled()
  })

  test("converts, caches images, and stores history when history does not exist", async () => {
    const navigate = jest.fn()
    ;(useNavigation as jest.Mock).mockReturnValue({ navigate })

    const selectedBook = createSelectedBook({
      id: 3,
      hash: 9,
      path: ["/a.png", "/b.png"],
      convert: jest.fn(async (_format, _libraryId, callback) => {
        await callback()
      }),
      metaData: {
        formats: ["EPUB"],
        size: 300,
        setProp: jest.fn(),
      },
    })
    const addReadingHistory = jest.fn()
    ;(cacheBookImages as jest.Mock).mockResolvedValue(["cache/a.png", "cache/b.png"])
    ;(ReadingHistoryModel.create as jest.Mock).mockReturnValue({ history: true })

    setupStore({ selectedBook, addReadingHistory })

    const { execute } = useOpenViewer()
    await execute({ openModal: jest.fn() } as any)

    expect(selectedBook.convert).toHaveBeenCalled()
    expect(cacheBookImages).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 3,
        format: "EPUB",
        libraryId: "lib1",
      }),
    )
    expect(ReadingHistoryModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 3,
        libraryId: "lib1",
        format: "EPUB",
        cachedPath: ["cache/a.png", "cache/b.png"],
      }),
    )
    expect(addReadingHistory).toHaveBeenCalledWith({ history: true })
    expect(navigate).toHaveBeenCalledWith("Viewer")
  })

  test("opens error modal when conversion fails", async () => {
    const navigate = jest.fn()
    const openModal = jest.fn()
    ;(useNavigation as jest.Mock).mockReturnValue({ navigate })

    const selectedBook = createSelectedBook({
      id: 4,
      hash: 10,
      path: ["/x.png"],
      convert: jest.fn(async () => {
        throw new Error("convert failed")
      }),
      metaData: {
        formats: ["EPUB"],
        size: 400,
        setProp: jest.fn(),
      },
    })
    setupStore({ selectedBook })

    const { execute } = useOpenViewer()
    await execute({ openModal } as any)

    expect(openModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        message: "convert failed",
        titleTx: "errors.failedConvert",
      }),
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})
