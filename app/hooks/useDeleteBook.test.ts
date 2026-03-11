import type { ModalStackParams } from "@/components/Modals/Types"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { UsableModalProp } from "react-native-modalfy"
import { useDeleteBook } from "./useDeleteBook"

type TestModal = UsableModalProp<ModalStackParams>

const createModal = (overrides: Partial<TestModal> = {}): TestModal => ({
  currentModal: null,
  openModal: jest.fn() as TestModal["openModal"],
  closeModal: jest.fn() as TestModal["closeModal"],
  closeModals: jest.fn() as TestModal["closeModals"],
  closeAllModals: jest.fn() as TestModal["closeAllModals"],
  ...overrides,
})

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

    execute(
      createModal({
        openModal: openModal as TestModal["openModal"],
        closeModal: closeModal as TestModal["closeModal"],
      }),
    )

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
