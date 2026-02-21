import type { MessageKey } from "@/i18n"
import type { Book, FieldMetadataMap, Metadata } from "@/models/calibre"
import type { LoginType } from "./LoginModal"
export type ModalStackParams = {
  ConfirmModal: {
    title?: string
    titleTx?: MessageKey
    message?: string
    messageTx?: MessageKey
    okTx?: MessageKey
    cancelTx?: MessageKey
    onOKPress?: () => void
    onCancelPress?: () => void
  }
  ErrorModal: {
    title?: string
    titleTx?: MessageKey
    message?: string
    messageTx?: MessageKey
  }
  FormatSelectModal: {
    formats: string[]
    onSelectFormat: (format: string) => void
  }
  LoginModal: { onLoginPress?: (data: LoginType) => void }
  BookDetailModal: {
    imageUrl: string
    selectedBook?: Book
    fieldNameList?: string[]
    fieldMetadataList?: FieldMetadataMap
    onLinkPress?: (linkName: string) => void
    onOpenBook?: () => Promise<void>
    onDownloadBook?: () => Promise<void>
    onConvertBook?: () => void
    onEditBook?: () => void
    onDeleteBook?: () => void
  }
  BookEditModal: {
    imageUrl: string
    selectedBook?: Book
    fieldMetadataList?: FieldMetadataMap
    onOKPress?: (value: Metadata, editFields: string[]) => void
  }
  ViewerAutoPageTurnSettingModal: {
    intervalMs: number
    onSave: (intervalMs: number) => void
  }
  ViewerRatingModal: {
    initialRating: number
    onSubmit: (rating: number) => void | Promise<void>
  }
}
