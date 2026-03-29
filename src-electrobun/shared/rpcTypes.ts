import type { RPCSchema } from "electrobun/bun"

export type AppRPCType = {
  bun: RPCSchema<{
    requests: {
      showNativeConfirm: {
        params: {
          title: string
          message: string
          okLabel: string
          cancelLabel: string
        }
        response: boolean
      }
      showNativeError: {
        params: {
          title: string
          message: string
        }
        response: void
      }
    }
    messages: {}
  }>
  webview: RPCSchema<{
    requests: {}
    messages: {}
  }>
}
