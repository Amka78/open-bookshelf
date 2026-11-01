import type { ModalStackParams } from "@/components/Modals/Types"
import { isNavigationReady, resetRoot } from "@/navigators"
import { isLargeScreen } from "@/utils/responsive"
import * as storage from "@/utils/storage"
import { modalfy } from "react-native-modalfy"

export type NavigateToConnectOptions = {
  retryIntervalMs?: number
  maxAttempts?: number
  /** Overrides the screen-size detection (used by tests). */
  largeScreen?: boolean
}

export type ResetAppToConnectOptions = NavigateToConnectOptions

/**
 * ナビゲーションのルートだけを Connect に戻す。保存済みデータは消さない。
 */
export async function navigateToConnect(options: NavigateToConnectOptions = {}) {
  const retryIntervalMs = options.retryIntervalMs ?? 50
  const maxAttempts = options.maxAttempts ?? 20
  const largeScreen = options.largeScreen ?? isLargeScreen()
  const routeName = largeScreen ? "Library" : "Connect"
  const routeKey = largeScreen ? "library-reset" : "connect-reset"

  return await new Promise<void>((resolve) => {
    let attempts = 0

    const tryReset = () => {
      if (isNavigationReady()) {
        resetRoot({ index: 0, routes: [{ key: routeKey, name: routeName }] })
        if (largeScreen) {
          modalfy<ModalStackParams>().openModal("ConnectModal", {})
        }
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
