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

// 永続化ストレージ。WebView の localStorage はランダムポートで origin が変わり
// 引き継がれないため、メインプロセスのユーザーデータ領域へファイル保存する。
;(globalThis as any).__electrobunStorageGet = async (key: string): Promise<string | null> => {
  const { value } = await electroview.rpc.request.storageGet({ key })
  return value
}

;(globalThis as any).__electrobunStorageSet = async (key: string, value: string): Promise<void> => {
  await electroview.rpc.request.storageSet({ key, value })
}

;(globalThis as any).__electrobunStorageRemove = async (key: string): Promise<void> => {
  await electroview.rpc.request.storageRemove({ key })
}

;(globalThis as any).__electrobunStorageClear = async (): Promise<void> => {
  await electroview.rpc.request.storageClear({})
}
