import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { Paths } from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Platform } from "react-native"
import type { UsableModalProp } from "react-native-modalfy"
import { useDownloadBook } from "./useDownloadBook"

type TestModal = UsableModalProp<ModalStackParams>

const setPlatformOS = (os: string) => {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    value: os,
  })
}

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
    setPlatformOS("web")
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test("downloads and shares when only one format exists", async () => {
    setPlatformOS("ios")

    const selectedBook = {
      id: 10,
      metaData: {
        title: "Single Format Book",
        formats: ["EPUB"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    jest.spyOn(api, "getBookDownloadUrl").mockReturnValue("https://example/book")
    jest.spyOn(api, "downloadFileWithAuth").mockResolvedValue({
      uri: "file:///documents/book.epub",
    } as any)

    const { execute } = useDownloadBook()
    const modal = createModal()

    await execute(modal)

    expect(api.getBookDownloadUrl).toHaveBeenCalledWith("EPUB", 10, "main")
    expect(api.downloadFileWithAuth).toHaveBeenCalledWith(
      "https://example/book",
      expect.objectContaining({ uri: `${Paths.document.uri}Single Format Book.EPUB` }),
      { idempotent: true },
    )
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///documents/book.epub")
  })

  test("opens format selector when multiple formats exist", async () => {
    setPlatformOS("ios")

    const openModal = jest.fn()
    const selectedBook = {
      id: 11,
      metaData: {
        title: "Multi Format Book",
        formats: ["EPUB", "PDF"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    jest.spyOn(api, "getBookDownloadUrl").mockReturnValue("https://example/book-pdf")
    jest.spyOn(api, "downloadFileWithAuth").mockResolvedValue({
      uri: "file:///documents/book.pdf",
    } as any)

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
    setPlatformOS("ios")

    const openModal = jest.fn()
    const selectedBook = {
      id: 12,
      metaData: {
        title: "Broken Book",
        formats: ["EPUB"],
      },
    }
    ;(useStores as jest.Mock).mockReturnValue(createStore(selectedBook))
    jest.spyOn(api, "getBookDownloadUrl").mockReturnValue("https://example/broken")
    jest.spyOn(api, "downloadFileWithAuth").mockRejectedValue(new Error("network failed"))

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
