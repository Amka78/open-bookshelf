import { ModalStackConfig } from "react-native-modalfy"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModalTemplate as LoginModal } from "./LoginModal"
import { BookDetailModalTemplate as BookDetailModal } from "./BookDetailModal"
import { BookEditModalTemplate as BookEditModal } from "./BookEditModal"
import { ConfirmModal } from "./ConfirmModal"

export const modalConfig: ModalStackConfig = {
  BookDetailModal,
  BookEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
}
