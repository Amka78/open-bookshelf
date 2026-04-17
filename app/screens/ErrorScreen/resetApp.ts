import { isNavigationReady, resetRoot } from "@/navigators"
import * as storage from "@/utils/storage"

export type ResetAppToConnectOptions = {
  retryIntervalMs?: number
  maxAttempts?: number
}

export async function resetAppToConnect(options: ResetAppToConnectOptions = {}) {
  const retryIntervalMs = options.retryIntervalMs ?? 50
  const maxAttempts = options.maxAttempts ?? 20

  await storage.clear()

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
