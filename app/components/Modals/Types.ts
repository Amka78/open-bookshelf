import { MessageKey } from "@/i18n"
import { LoginType } from "./LoginModal"
import { Library } from "@/models/CalibreRootStore"
import { Category, FieldMetadata } from "@/models/calibre"

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
    book: Library
    imageUrl: string
    fieldMetadatas: FieldMetadata[]
    fields: string[]
    onDeleteConfirmOKPress?: () => void
  }
}
