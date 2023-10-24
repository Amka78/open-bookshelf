import { MessageKey } from "@/i18n"
import { Api } from "@/services/api"
import { GeneralApiProblem } from "@/services/api/apiProblem"

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

export function ConvertApiErrorToException(apiProblem: GeneralApiProblem) {
  switch (apiProblem.kind) {
    case "cannot-connect":
      throw new ApiError({
        errorTx: "errors.canNotConnect",
        descriptionTx: "errors.canNotConnectDescription",
      })
    default:
      break
  }
}
