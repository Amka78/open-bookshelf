/**
 * Electrobun bridge utilities for native OS dialog integration.
 * These functions are available only when running inside Electrobun desktop shell.
 * The preload script (src-electrobun/preload.ts) injects __ELECTROBUN__ and the
 * dialog bridge functions into globalThis before the web app loads.
 */

declare global {
  interface Window {
    __ELECTROBUN__?: boolean
    __electrobunShowConfirm?: (
      title: string,
      message: string,
      okLabel: string,
      cancelLabel: string,
    ) => Promise<boolean>
    __electrobunShowError?: (title: string, message: string) => Promise<void>
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
