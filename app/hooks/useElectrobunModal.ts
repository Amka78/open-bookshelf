import type { ModalStackParams } from "@/components/Modals/Types"
import { translate } from "@/i18n"
import { isElectrobun, showNativeConfirm, showNativeError } from "@/utils/electrobunBridge"
import { useModal } from "react-native-modalfy"

type OpenModalFn = ReturnType<typeof useModal<ModalStackParams>>["openModal"]

/**
 * Wraps react-native-modalfy's useModal to intercept ConfirmModal and ErrorModal
 * when running inside Electrobun desktop shell, replacing them with native OS dialogs.
 * All other modals pass through to the standard web-based modal system.
 */
export function useElectrobunModal() {
  const modal = useModal<ModalStackParams>()

  if (!isElectrobun()) {
    return modal
  }

  const openModal: OpenModalFn = (name, params?) => {
    if (name === "ConfirmModal") {
      const p = params as ModalStackParams["ConfirmModal"]
      const title = p?.title ?? (p?.titleTx ? translate(p.titleTx) : "")
      const message = p?.message ?? (p?.messageTx ? translate(p.messageTx) : "")
      const okLabel = p?.okTx ? translate(p.okTx) : translate("common.ok")
      const cancelLabel = p?.cancelTx ? translate(p.cancelTx) : translate("common.cancel")

      showNativeConfirm(title, message, okLabel, cancelLabel).then((confirmed) => {
        if (confirmed) {
          p?.onOKPress?.()
        } else {
          p?.onCancelPress?.()
        }
      })
      return
    }

    if (name === "ErrorModal") {
      const p = params as ModalStackParams["ErrorModal"]
      const title = p?.title ?? (p?.titleTx ? translate(p.titleTx) : "Error")
      const message = p?.message ?? (p?.messageTx ? translate(p.messageTx) : "")

      showNativeError(title, message)
      return
    }

    modal.openModal(name, params)
  }

  return {
    ...modal,
    openModal,
  }
}
