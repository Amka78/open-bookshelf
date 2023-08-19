import { MessageKey } from "@/i18n"
export type ModalStackParams = {
  ErrorModal: { title?: string; titleTx?: MessageKey; message?: string; messageTx?: MessageKey }
  FormatSelectModal: { formats: string[]; onSelectFormat: (format: string) => void }
}
