import type { ModalStackParams } from "@/components/Modals/Types"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { UsableModalProp } from "react-native-modalfy"

export function useDeleteBook() {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook
  const execute = (modal: UsableModalProp<ModalStackParams>) => {
    modal.openModal("ConfirmModal", {
      titleTx: "modal.deleteConfirmModal.title",
      message: translate({
        key: "modal.deleteConfirmModal.message",
        restParam: [{ key: selectedBook.metaData.title, translate: false }],
      }),
      onOKPress: async () => {
        selectedLibrary.deleteBook(selectedBook.id)
        modal.closeModal()
      },
    })
  }

  return {
    execute,
  }
}
