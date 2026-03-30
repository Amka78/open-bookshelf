import type { ModalStackConfig } from "react-native-modalfy"
import { BookConvertModal } from "./BookConvertModal"
import { BulkEditModal } from "./BulkEditModal"
import { BookDetailModal } from "./BookDetailModal"
import { BookEditModal } from "./BookEditModal"
import { ConfirmModal } from "./ConfirmModal"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { LoginModal } from "./LoginModal"
import { ViewerAutoPageTurnSettingModal } from "./ViewerAutoPageTurnSettingModal"
import { ViewerRatingModal } from "./ViewerRatingModal"

export const modalConfig: ModalStackConfig = {
  BookConvertModal,
  BookDetailModal,
  BookEditModal,
  BulkEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  LoginModal,
  ViewerAutoPageTurnSettingModal,
  ViewerRatingModal,
}
