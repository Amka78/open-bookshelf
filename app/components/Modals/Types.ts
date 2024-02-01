import { MessageKey } from "@/i18n"
import { LoginType } from "./LoginModal"
import { Category, Library } from "@/models/CalibreRootStore"

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
  BookDetailModal: { library: Library; imageUrl: string; categories: Category[] }
}
