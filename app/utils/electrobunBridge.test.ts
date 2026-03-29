import { afterEach, describe, expect, jest, test } from "bun:test"

import { isElectrobun, showNativeConfirm, showNativeError } from "./electrobunBridge"

describe("electrobunBridge", () => {
  const originalElectrobunFlag = window.__ELECTROBUN__
  const originalShowConfirm = window.__electrobunShowConfirm
  const originalShowError = window.__electrobunShowError

  afterEach(() => {
    window.__ELECTROBUN__ = originalElectrobunFlag
    window.__electrobunShowConfirm = originalShowConfirm
    window.__electrobunShowError = originalShowError
    jest.restoreAllMocks()
  })

  test("detects when the app is not running inside Electrobun", () => {
    window.__ELECTROBUN__ = false

    expect(isElectrobun()).toBe(false)
  })

  test("detects when the app is running inside Electrobun", () => {
    window.__ELECTROBUN__ = true

    expect(isElectrobun()).toBe(true)
  })

  test("returns false from showNativeConfirm when Electrobun is not active", async () => {
    window.__ELECTROBUN__ = false
    const nativeConfirm = jest.fn().mockResolvedValue(true)
    window.__electrobunShowConfirm = nativeConfirm

    const confirmed = await showNativeConfirm("Title", "Message")

    expect(confirmed).toBe(false)
    expect(nativeConfirm).not.toHaveBeenCalled()
  })

  test("returns false from showNativeConfirm when the native confirm bridge is unavailable", async () => {
    window.__ELECTROBUN__ = true
    window.__electrobunShowConfirm = undefined

    const confirmed = await showNativeConfirm("Title", "Message")

    expect(confirmed).toBe(false)
  })

  test("passes all confirm arguments to the native Electrobun bridge", async () => {
    window.__ELECTROBUN__ = true
    const nativeConfirm = jest.fn().mockResolvedValue(true)
    window.__electrobunShowConfirm = nativeConfirm

    const confirmed = await showNativeConfirm("Resume", "Continue?", "Yes", "No")

    expect(confirmed).toBe(true)
    expect(nativeConfirm).toHaveBeenCalledWith("Resume", "Continue?", "Yes", "No")
  })

  test("returns without calling the native error bridge when Electrobun is not active", async () => {
    window.__ELECTROBUN__ = false
    const nativeError = jest.fn().mockResolvedValue(undefined)
    window.__electrobunShowError = nativeError

    await showNativeError("Error", "Failure")

    expect(nativeError).not.toHaveBeenCalled()
  })

  test("returns without failure when the native error bridge is unavailable", async () => {
    window.__ELECTROBUN__ = true
    window.__electrobunShowError = undefined

    await expect(showNativeError("Error", "Failure")).resolves.toBeUndefined()
  })

  test("passes all error arguments to the native Electrobun bridge", async () => {
    window.__ELECTROBUN__ = true
    const nativeError = jest.fn().mockResolvedValue(undefined)
    window.__electrobunShowError = nativeError

    await showNativeError("Error", "Failure")

    expect(nativeError).toHaveBeenCalledWith("Error", "Failure")
  })
})
