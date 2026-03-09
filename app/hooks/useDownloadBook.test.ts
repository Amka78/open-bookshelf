import { useDownloadBook } from "./useDownloadBook"
import { useStores } from "@/models"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { api } from "@/services/api"
import type { ModalStackParams } from "@/components/Modals/Types"
import type { UsableModalProp } from "react-native-modalfy"

type TestModal = UsableModalProp<ModalStackParams>

jest.mock("@/models", () => ({
  useStores: jest.fn(),
}))

jest.mock("expo-file-system", () => ({
  downloadAsync: jest.fn(),
  documentDirectory: "file:///documents/",
}))

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(),
}))

jest.mock("@/services/api", () => ({
  api: {
    getBookDownloadUrl: jest.fn(),
  },
}))

describe("useDownloadBook", () => {
  const createStore = (selectedBook: {
    id: number
    metaData: { title: string; formats: string[] }
  }) => {
    return {
      authenticationStore: {
        getHeader: jest.fn().mockReturnValue({ Authorization: "Basic token" }),
      },
      calibreRootStore: {
        selectedLibrary: {
          id: "main",
          selectedBook,
        },
      },
    }
  }

  const createModal = (overrides: Partial<TestModal> = {}): TestModal => ({
    currentModal: null,
    openModal: jest.fn() as TestModal["openModal"],
    closeModal: jest.fn() as TestModal["closeModal"],
    closeModals: jest.fn() as TestModal["closeModals"],
    closeAllModals: jest.fn() as TestModal["closeAllModals"],
    ...overrides,
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("downloads and shares when only one format exists", async () => {
    const selectedBook = {
      id: 10,
      metaData: {
        title: "Single Format Book",
        formats: ["EPUB"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    ;(api.getBookDownloadUrl as jest.Mock).mockReturnValue("https://example/book")
    ;(FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
      uri: "file:///documents/book.epub",
    })

    const { execute } = useDownloadBook()
    const modal = createModal()

    await execute(modal)

    expect(api.getBookDownloadUrl).toHaveBeenCalledWith("EPUB", 10, "main")
    expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
      "https://example/book",
      "file:///documents/Single Format Book.EPUB",
      { headers: { Authorization: "Basic token" } },
    )
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///documents/book.epub")
  })

  test("opens format selector when multiple formats exist", async () => {
    const openModal = jest.fn()
    const selectedBook = {
      id: 11,
      metaData: {
        title: "Multi Format Book",
        formats: ["EPUB", "PDF"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    ;(api.getBookDownloadUrl as jest.Mock).mockReturnValue("https://example/book-pdf")
    ;(FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
      uri: "file:///documents/book.pdf",
    })

    const { execute } = useDownloadBook()
    await execute(createModal({ openModal: openModal as TestModal["openModal"] }))

    expect(openModal).toHaveBeenCalledWith(
      "FormatSelectModal",
      expect.objectContaining({
        formats: ["EPUB", "PDF"],
      }),
    )

    const [, options] = openModal.mock.calls[0]
    await options.onSelectFormat("PDF")

    expect(api.getBookDownloadUrl).toHaveBeenCalledWith("PDF", 11, "main")
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///documents/book.pdf")
  })

  test("opens error modal when download fails", async () => {
    const openModal = jest.fn()
    const selectedBook = {
      id: 12,
      metaData: {
        title: "Broken Book",
        formats: ["EPUB"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    ;(api.getBookDownloadUrl as jest.Mock).mockReturnValue("https://example/broken")
    ;(FileSystem.downloadAsync as jest.Mock).mockRejectedValue(new Error("network failed"))

    const { execute } = useDownloadBook()

    await execute(createModal({ openModal: openModal as TestModal["openModal"] }))

    expect(openModal).toHaveBeenCalledWith(
      "ErrorModal",
      expect.objectContaining({
        title: "Error",
        message: "network failed",
      }),
    )
  })
})
