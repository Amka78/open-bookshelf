import {
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { localizeTestRegistrar } from "../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

mock.module("@/models", () => ({
  useStores: jest.fn(),
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}))

let useOpenViewer: typeof import("./useOpenViewer").useOpenViewer

beforeAll(async () => {
  ;({ useOpenViewer } = await import("./useOpenViewer"))
})

describe("useOpenViewer", () => {
  const navigate = jest.fn()
  const openModal = jest.fn()

  const selectedBook = {
    id: 11,
    metaData: {
      formats: ["EPUB"],
      setProp: jest.fn(),
    },
  }

  const modal = {
    openModal,
  } as Parameters<ReturnType<typeof useOpenViewer>["execute"]>[0]

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
    ;(useStores as jest.Mock).mockReturnValue({
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
    jest.restoreAllMocks()
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
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["PDF"],
              setProp: jest.fn(),
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
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["EPUB", "PDF"],
              setProp: jest.fn(),
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
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "library-1",
          selectedBook: {
            ...selectedBook,
            metaData: {
              formats: ["EPUB", "PDF"],
              setProp: jest.fn(),
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
