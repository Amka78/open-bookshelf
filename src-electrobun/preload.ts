import { Electroview } from "electrobun/view"
import type { AppRPCType } from "./shared/rpcTypes"

const rpc = Electroview.defineRPC<AppRPCType>({
  handlers: {
    requests: {},
    messages: {},
  },
})

const electroview = new Electroview({ rpc })

// Expose Electrobun context flag and native dialog bridges to the web app
;(globalThis as any).__ELECTROBUN__ = true

;(globalThis as any).__electrobunShowConfirm = async (
  title: string,
  message: string,
  okLabel: string,
  cancelLabel: string,
): Promise<boolean> => {
  const { response } = await electroview.rpc.request.showNativeConfirm({
    title,
    message,
    okLabel,
    cancelLabel,
  })
  return response === 0
}

;(globalThis as any).__electrobunShowError = async (
  title: string,
  message: string,
): Promise<void> => {
  await electroview.rpc.request.showNativeError({ title, message })
}
