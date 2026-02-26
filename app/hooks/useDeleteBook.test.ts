import { useDeleteBook } from "./useDeleteBook"
import { useStores } from "@/models"
import { translate } from "@/i18n"

jest.mock("@/models", () => ({
  useStores: jest.fn(),
}))

jest.mock("@/i18n", () => ({
  translate: jest.fn(),
}))

describe("useDeleteBook", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("opens confirm modal and deletes selected book on OK", async () => {
    const deleteBook = jest.fn()
    const closeModal = jest.fn()
    const openModal = jest.fn()
    const selectedBook = {
      id: 123,
      metaData: {
        title: "Book Title",
      },
    }
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          selectedBook,
          deleteBook,
        },
      },
    })
    ;(translate as jest.Mock).mockReturnValue("translated message")

    const { execute } = useDeleteBook()

    execute({ openModal, closeModal } as any)

    expect(openModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "modal.deleteConfirmModal.title",
        message: "translated message",
      }),
    )

    const [, options] = openModal.mock.calls[0]
    await options.onOKPress()

    expect(deleteBook).toHaveBeenCalledWith(123)
    expect(closeModal).toHaveBeenCalledTimes(1)
  })
})
