import type { ModalStackConfig } from "react-native-modalfy"
import { BookDetailModal } from "./BookDetailModal"
import { BookEditModal } from "./BookEditModal"
import { ConfirmModal } from "./ConfirmModal"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModal } from "./LoginModal"

export const modalConfig: ModalStackConfig = {
  BookDetailModal,
  BookEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
}
