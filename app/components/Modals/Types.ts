import { MessageKey } from "@/i18n"
import { LoginType } from "./LoginModal"

export type ModalStackParams = {
  ConfirmModal: {
    title?: string
    titleTx?: MessageKey
    message?: string
    messageTx?: MessageKey
    onOKPress?: () => void
  }
  ErrorModal: {
    title?: string
    titleTx?: MessageKey
    message?: string
    messageTx?: MessageKey
  }
  FormatSelectModal: { formats: string[]; onSelectFormat: (format: string) => void }
  LoginModal: { onLoginPress: (data: LoginType) => void }
  BookDetailModal: {
    imageUrl: string
    onDeleteConfirmOKPress?: () => void
    onLinkPress?: (linkName: string) => void
  }
}
