import { isNavigationReady, resetRoot } from "@/navigators"
import * as storage from "@/utils/storage"

export type NavigateToConnectOptions = {
  retryIntervalMs?: number
  maxAttempts?: number
}

export type ResetAppToConnectOptions = NavigateToConnectOptions

/**
 * ナビゲーションのルートだけを Connect に戻す。保存済みデータは消さない。
 */
export async function navigateToConnect(options: NavigateToConnectOptions = {}) {
  const retryIntervalMs = options.retryIntervalMs ?? 50
  const maxAttempts = options.maxAttempts ?? 20

  return await new Promise<void>((resolve) => {
    let attempts = 0

    const tryReset = () => {
      if (isNavigationReady()) {
        resetRoot({ index: 0, routes: [{ key: "connect-reset", name: "Connect" }] })
        resolve()
        return
      }

      attempts += 1
      if (attempts >= maxAttempts) {
        resolve()
        return
      }

      setTimeout(tryReset, retryIntervalMs)
    }

    setTimeout(tryReset, 0)
  })
}

export async function resetAppToConnect(options: ResetAppToConnectOptions = {}) {
  await storage.clear()

  return navigateToConnect(options)
}
