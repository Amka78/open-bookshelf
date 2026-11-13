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
      // WebView の localStorage は Electrobun のローカルサーバーのポートが
      // 起動ごとに変わるため origin 単位のデータが引き継がれない。代わりに
      // メインプロセスのユーザーデータ領域へファイル保存して永続化する。
      storageGet: {
        params: {
          key: string
        }
        response: {
          value: string | null
        }
      }
      storageSet: {
        params: {
          key: string
          value: string
        }
        response: void
      }
      storageRemove: {
        params: {
          key: string
        }
        response: void
      }
      storageClear: {
        params: {}
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
