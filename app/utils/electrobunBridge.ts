/**
 * Electrobun bridge utilities for native OS dialog integration.
 * These functions are available only when running inside Electrobun desktop shell.
 * The preload script (src-electrobun/preload.ts) injects __ELECTROBUN__ and the
 * dialog bridge functions into globalThis before the web app loads.
 */

declare global {
  interface Window {
    __ELECTROBUN__?: boolean
    __ELECTROBUN_PROXY_ORIGIN?: string
    /**
     * Web リリース（Docker）で nginx が index.html に注入するフラグ。
     * 有効な場合、アプリは同一オリジンの /__calibre/ をプロキシとして使う。
     */
    __CALIBRE_WEB_PROXY__?: boolean
    __electrobunShowConfirm?: (
      title: string,
      message: string,
      okLabel: string,
      cancelLabel: string,
    ) => Promise<boolean>
    __electrobunShowError?: (title: string, message: string) => Promise<void>
    /**
     * 起動をまたいだ状態保存（storage.ts から利用）。WebView の localStorage は
     * Electrobun のローカルサーバーのポートが起動ごとに変わるため origin 単位で
     * 引き継がれず、メインプロセスのユーザーデータ領域へファイル保存する。
     */
    __electrobunStorageGet?: (key: string) => Promise<string | null>
    __electrobunStorageSet?: (key: string, value: string) => Promise<void>
    __electrobunStorageRemove?: (key: string) => Promise<void>
    __electrobunStorageClear?: () => Promise<void>
  }
}

export function isElectrobun(): boolean {
  return typeof window !== "undefined" && window.__ELECTROBUN__ === true
}

export async function showNativeConfirm(
  title: string,
  message: string,
  okLabel = "OK",
  cancelLabel = "Cancel",
): Promise<boolean> {
  if (!isElectrobun() || !window.__electrobunShowConfirm) {
    return false
  }
  return window.__electrobunShowConfirm(title, message, okLabel, cancelLabel)
}

export async function showNativeError(title: string, message: string): Promise<void> {
  if (!isElectrobun() || !window.__electrobunShowError) {
    return
  }
  await window.__electrobunShowError(title, message)
}

/** Reads a persisted value from the Electrobun main process. Returns null if unavailable. */
export async function storageGet(key: string): Promise<string | null> {
  if (!isElectrobun() || !window.__electrobunStorageGet) {
    return null
  }
  return window.__electrobunStorageGet(key)
}

/** Persists a value in the Electrobun main process. */
export async function storageSet(key: string, value: string): Promise<void> {
  if (!isElectrobun() || !window.__electrobunStorageSet) {
    return
  }
  await window.__electrobunStorageSet(key, value)
}

/** Removes a persisted value in the Electrobun main process. */
export async function storageRemove(key: string): Promise<void> {
  if (!isElectrobun() || !window.__electrobunStorageRemove) {
    return
  }
  await window.__electrobunStorageRemove(key)
}

/** Clears all persisted values in the Electrobun main process. */
export async function storageClear(): Promise<void> {
  if (!isElectrobun() || !window.__electrobunStorageClear) {
    return
  }
  await window.__electrobunStorageClear()
}
