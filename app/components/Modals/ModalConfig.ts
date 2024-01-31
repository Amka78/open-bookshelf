import { ModalStackConfig } from "react-native-modalfy"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModal } from "./LoginModal"
import { BookDetailModal } from "./BookDetailModal"

export const modalConfig: ModalStackConfig = {
  BookDetailModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
}
