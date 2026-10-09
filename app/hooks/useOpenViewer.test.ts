import {
  vi,
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  test as baseTest,
} from "vitest"
import { localizeTestRegistrar } from "../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

vi.doMock("@/models", () => ({
  useStores: vi.fn(),
}))

vi.doMock("@react-navigation/native", () => ({
  useNavigation: vi.fn(),
}))

// 静的 import だと setup が登録した mock インスタンスを掴んでしまい、vi.doMock 後に
// 動的 import される useOpenViewer 内部のものと別物になる（bun の mock.module は
// 登録簿を遡及的に書き換えるため同一だった）。mock を共有するため全て動的に取得する。
let useStores: typeof import("@/models").useStores
let useNavigation: typeof import("@react-navigation/native").useNavigation
let useOpenViewer: typeof import("./useOpenViewer").useOpenViewer

beforeAll(async () => {
  ;({ useStores } = await import("@/models"))
  ;({ useNavigation } = await import("@react-navigation/native"))
  ;({ useOpenViewer } = await import("./useOpenViewer"))
})

describe("useOpenViewer", () => {
  const navigate = vi.fn()
  const openModal = vi.fn()

  const selectedBook = {
    id: 11,
    metaData: {
      formats: ["EPUB"],
      setProp: vi.fn(),
    },
  }

  const modal = {
    openModal,
  } as Parameters<ReturnType<typeof useOpenViewer>["execute"]>[0]

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useNavigation as vi.Mock).mockReturnValue({ navigate })
    ;(useStores as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook,
        },
      },
      settingStore: {
        preferredFormat: undefined,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("navigates to Viewer with a preparation request for non-PDF formats", async () => {
    const { execute } = useOpenViewer()

    await execute(modal)

    expect(selectedBook.metaData.setProp).toHaveBeenCalledWith("selectedFormat", "EPUB")
    expect(navigate).toHaveBeenCalledWith("Viewer", {
      request: {
        bookId: 11,
        libraryId: "library-1",
        format: "EPUB",
      },
    })
  })

  test("navigates to PDFViewer with a preparation request for PDF", async () => {
    ;(useStores as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["PDF"],
              setProp: vi.fn(),
            },
          },
        },
      },
      settingStore: {
        preferredFormat: undefined,
      },
    })

    const { execute } = useOpenViewer()

    await execute(modal)

    expect(navigate).toHaveBeenCalledWith("PDFViewer", {
      request: {
        bookId: 11,
        libraryId: "library-1",
        format: "PDF",
      },
    })
  })

  test("uses the preferred format when it is available", async () => {
    ;(useStores as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["EPUB", "PDF"],
              setProp: vi.fn(),
            },
          },
        },
      },
      settingStore: {
        preferredFormat: "PDF",
      },
    })

    const { execute } = useOpenViewer()

    await execute(modal)

    expect(openModal).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith("PDFViewer", {
      request: {
        bookId: 11,
        libraryId: "library-1",
        format: "PDF",
      },
    })
  })

  test("opens the format selector when multiple formats exist without a preferred format", async () => {
    ;(useStores as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["EPUB", "PDF"],
              setProp: vi.fn(),
            },
          },
        },
      },
      settingStore: {
        preferredFormat: undefined,
      },
    })

    const { execute } = useOpenViewer()

    await execute(modal)

    expect(openModal).toHaveBeenCalledWith(
      "FormatSelectModal",
      expect.objectContaining({
        formats: ["EPUB", "PDF"],
      }),
    )

    const formatSelectArgs = openModal.mock.calls[0]?.[1] as
      | { onSelectFormat: (format: string) => Promise<void> }
      | undefined

    await formatSelectArgs?.onSelectFormat("PDF")

    expect(navigate).toHaveBeenCalledWith("PDFViewer", {
      request: {
        bookId: 11,
        libraryId: "library-1",
        format: "PDF",
      },
    })
  })
})
