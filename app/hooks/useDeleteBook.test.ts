import type { ModalStackParams } from "@/components/Modals/Types"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { UsableModalProp } from "react-native-modalfy"
import { useDeleteBook } from "./useDeleteBook"

type TestModal = UsableModalProp<ModalStackParams>

const createModal = (overrides: Partial<TestModal> = {}): TestModal => ({
  currentModal: null,
  openModal: vi.fn() as TestModal["openModal"],
  closeModal: vi.fn() as TestModal["closeModal"],
  closeModals: vi.fn() as TestModal["closeModals"],
  closeAllModals: vi.fn() as TestModal["closeAllModals"],
  ...overrides,
})

vi.mock("@/i18n", () => ({
  translate: vi.fn(),
}))

describe("useDeleteBook", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test("opens confirm modal and deletes selected book on OK", async () => {
    const deleteBook = vi.fn()
    const closeModal = vi.fn()
    const openModal = vi.fn()
    const selectedBook = {
      id: 123,
      metaData: {
        title: "Book Title",
      },
    }
    ;(useStores as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          selectedBook,
          deleteBook,
        },
      },
    })
    ;(translate as vi.Mock).mockReturnValue("translated message")

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
