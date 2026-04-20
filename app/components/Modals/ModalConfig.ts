import type { ModalStackConfig } from "react-native-modalfy"
import { AnnotationModal } from "./AnnotationModal"
import { BookConvertModal } from "./BookConvertModal"
import { BookDetailModal } from "./BookDetailModal"
import { BookEditModal } from "./BookEditModal"
import { BookOcrReviewModal } from "./BookOcrReviewModal"
import { BulkEditModal } from "./BulkEditModal"
import { ConfirmModal } from "./ConfirmModal"
import { ErrorModal } from "./ErrorModal"
import { FormatSelectModal } from "./FormatSelectModal"
import { JobQueueModal } from "./JobQueueModal"
import { LoginModal } from "./LoginModal"
import { ReadingSettingsModal } from "./ReadingSettingsModal"
import { ReadingStatsModal } from "./ReadingStatsModal"
import { TocModal } from "./TocModal"
import { UserPreferencesModal } from "./UserPreferencesModal"
import { ViewerAutoPageTurnSettingModal } from "./ViewerAutoPageTurnSettingModal"
import { ViewerRatingModal } from "./ViewerRatingModal"

export const modalConfig: ModalStackConfig = {
  AnnotationModal,
  BookConvertModal,
  BookDetailModal,
  BookEditModal,
  BookOcrReviewModal,
  BulkEditModal,
  ConfirmModal,
  ErrorModal,
  FormatSelectModal,
  JobQueueModal,
  LoginModal,
  ReadingSettingsModal,
  ReadingStatsModal,
  TocModal,
  UserPreferencesModal,
  ViewerAutoPageTurnSettingModal,
  ViewerRatingModal,
}
