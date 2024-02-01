import { ModalStackConfig } from "react-native-modalfy"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModal } from "./LoginModal"
import { BookDetailModal } from "./BookDetailModal"
import { ConfirmModal } from "./ConfirmModal"

export const modalConfig: ModalStackConfig = {
  BookDetailModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
}
