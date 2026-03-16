import type { ModalStackParams } from "@/components/Modals/Types"
import type { MessageKey } from "@/i18n"
import { navigate, navigationRef } from "@/navigators/navigationUtilities"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { modalfy } from "react-native-modalfy"

const runOnNextFrame = (callback: () => void) => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(() => {
      callback()
    })
  }

  return setTimeout(callback, 0)
}

const openModalDeferred = (
  modal: ReturnType<typeof modalfy<ModalStackParams>>,
  modalName: keyof ModalStackParams,
  params?: ModalStackParams[keyof ModalStackParams],
) => {
  runOnNextFrame(() => {
    runOnNextFrame(() => {
      if (params) {
        modal.openModal(modalName as never, params as never)
        return
      }

      modal.openModal(modalName as never)
    })
  })
}

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
      openModalDeferred(modal, "LoginModal")
      break
    case "cannot-connect":
      openModalDeferred(modal, "ErrorModal", {
        titleTx: "errors.canNotConnect",
        messageTx: "errors.canNotConnectDescription",
      })
      break
    case "timeout":
      openModalDeferred(modal, "ErrorModal", {
        titleTx: "errors.timeout",
        messageTx: "errors.timeoutDescription",
      })
      break
    case "not-found": {
      const currentRoute = navigationRef.isReady()
        ? navigationRef.getCurrentRoute()?.name
        : undefined
      if (currentRoute === "Connect") break
      openModalDeferred(modal, "ConfirmModal", {
        titleTx: "errors.notFound",
        messageTx: "errors.notFoundDescription",
        okTx: "common.yes",
        cancelTx: "common.no",
        onOKPress: () => {
          navigate("Connect")
        },
      })
      break
    }
    default:
      break
  }
}
