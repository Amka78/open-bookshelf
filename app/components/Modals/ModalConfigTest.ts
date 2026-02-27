import type { ModalStackConfig } from "react-native-modalfy"
import { BookConvertModalTemplate as BookConvertModal } from "./BookConvertModal"
import { BookDetailModalTemplate as BookDetailModal } from "./BookDetailModal"
import { BookEditModalTemplate as BookEditModal } from "./BookEditModal"
import { ConfirmModal } from "./ConfirmModal"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModalTemplate as LoginModal } from "./LoginModal"

export const modalConfig: ModalStackConfig = {
  BookConvertModal,
  BookDetailModal,
  BookEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
}
