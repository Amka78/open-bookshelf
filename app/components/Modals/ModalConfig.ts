import type { ModalStackConfig } from "react-native-modalfy"
import { AnnotationModal } from "./AnnotationModal"
import { BookConvertModal } from "./BookConvertModal"
import { BulkEditModal } from "./BulkEditModal"
import { BookDetailModal } from "./BookDetailModal"
import { BookEditModal } from "./BookEditModal"
import { ConfirmModal } from "./ConfirmModal"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { JobQueueModal } from "./JobQueueModal"
import { LoginModal } from "./LoginModal"
import { ReadingStatsModal } from "./ReadingStatsModal"
import { UserPreferencesModal } from "./UserPreferencesModal"
import { ViewerAutoPageTurnSettingModal } from "./ViewerAutoPageTurnSettingModal"
import { ViewerRatingModal } from "./ViewerRatingModal"

export const modalConfig: ModalStackConfig = {
  AnnotationModal,
  BookConvertModal,
  BookDetailModal,
  BookEditModal,
  BulkEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  JobQueueModal,
  LoginModal,
  ReadingStatsModal,
  UserPreferencesModal,
  ViewerAutoPageTurnSettingModal,
  ViewerRatingModal,
}
