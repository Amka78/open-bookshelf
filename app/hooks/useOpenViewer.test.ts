import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { ReadingHistoryModel } from "@/models/calibre"
import * as bookImageCache from "@/utils/bookImageCache"
import { useNavigation } from "@react-navigation/native"
import type { UsableModalProp } from "react-native-modalfy"
import { useOpenViewer } from "./useOpenViewer"

type TestModal = UsableModalProp<ModalStackParams>

const createModal = (overrides: Partial<TestModal> = {}): TestModal => ({
  currentModal: null,
  openModal: jest.fn() as TestModal["openModal"],
  closeModal: jest.fn() as TestModal["closeModal"],
  closeModals: jest.fn() as TestModal["closeModals"],
  closeAllModals: jest.fn() as TestModal["closeAllModals"],
  ...overrides,
})

type MockSelectedBook = {
  id: number
  hash: number
  path: string[]
  convert: jest.Mock
  metaData: {
    formats: string[]
    size: number
    setProp: jest.Mock
  }
}

type ReadingHistoryEntry = {
  libraryId: string
  bookId: number
  format: string
}

describe("useOpenViewer", () => {
  const createSelectedBook = (overrides: Partial<MockSelectedBook> = {}): MockSelectedBook => {
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
    selectedBook: MockSelectedBook
    readingHistories?: ReadingHistoryEntry[]
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
    jest.restoreAllMocks()
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

    const { execute } = useOpenViewer()

    await execute(createModal())

    expect(selectedBook.metaData.setProp).toHaveBeenCalledWith("selectedFormat", "PDF")
    expect(navigate).toHaveBeenCalledWith("PDFViewer")
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
    await execute(createModal())

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
    jest.spyOn(bookImageCache, "cacheBookImages").mockResolvedValue(["cache/a.png", "cache/b.png"])
    jest.spyOn(ReadingHistoryModel, "create").mockReturnValue({ history: true } as never)

    setupStore({ selectedBook, addReadingHistory })

    const { execute } = useOpenViewer()
    await execute(createModal())

    expect(selectedBook.convert).toHaveBeenCalled()
    expect(bookImageCache.cacheBookImages).toHaveBeenCalledWith(
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
    await execute(createModal({ openModal: openModal as TestModal["openModal"] }))

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
