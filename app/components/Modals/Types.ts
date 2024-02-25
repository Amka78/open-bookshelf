import { MessageKey } from "@/i18n"
import { LoginType } from "./LoginModal"
import { Book } from "@/models/CalibreRootStore"
import { FieldMetadataMap } from "@/models/calibre"
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
  LoginModal: { onLoginPress?: (data: LoginType) => void } 
  BookDetailModal: {
    imageUrl: string
    selectedBook?: Book,
    fieldNameList?: string[],
    fieldMetadataList?: FieldMetadataMap,
    onLinkPress?: (linkName: string) => void
    onOpenBook?: () => Promise<void>,
    onDownloadBook?: () => Promise<void>
    onConvertBook?: () => void
    onShowEdit?: () => void
    onDeleteBook?: () => void
    onDeleteConfirmOKPress?: () => void
  }
}

