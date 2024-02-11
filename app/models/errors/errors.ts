import { ModalStackParams } from "@/components/Modals/Types"
import { MessageKey } from "@/i18n"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { modalfy } from "react-native-modalfy"

type ApiErrorConstructoArgs = {
  error?: string
  errorTx?: MessageKey
  description?: string
  descriptionTx?: MessageKey
}
export class ApiError {
  private _error: string
  private _errorTx: MessageKey
  private _description: string
  private _descriptionTx: MessageKey

  constructor(args: ApiErrorConstructoArgs) {
    this._error = args.error
    this._errorTx = args.errorTx
    this._description = args.description
    this._descriptionTx = args.descriptionTx
  }

  public get error(): string {
    return this._error
  }

  public get errorTx(): MessageKey {
    return this._errorTx
  }

  public get description(): string {
    return this._description
  }

  public get descriptionTx(): MessageKey {
    return this._descriptionTx
  }
}

export function handleCommonApiError(apiProblem: GeneralApiProblem) {
  const modal = modalfy<ModalStackParams>()
  switch (apiProblem.kind) {
    case "unauthorized":
      modal.openModal("LoginModal")
      break
    case "cannot-connect":
      modal.openModal("ErrorModal", {
        titleTx: "errors.canNotConnect",
        messageTx: "errors.canNotConnectDescription",
      })
      break
    case "timeout":
      modal.openModal("ErrorModal", {
        titleTx: "errors.timeout",
        messageTx: "errors.timeoutDescription",
      })
      break
    default:
      break
  }
}
