import { MessageKey } from "@/i18n"
import { LoginType } from "./LoginModal"
import { Book } from "@/models/CalibreRootStore"
import { Category, FieldMetadata } from "@/models/calibre"
import { ImageSource } from "expo-image"

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
    book: Book
    imageUrl: string
    fieldMetadatas: FieldMetadata[]
    fields: string[]
    onDeleteConfirmOKPress?: () => void
    onLinkPress?: (linkName: string) => void
  }
}
