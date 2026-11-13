import { vi, afterEach, describe, expect, test } from "vitest"

import {
  isElectrobun,
  showNativeConfirm,
  showNativeError,
  storageClear,
  storageGet,
  storageRemove,
  storageSet,
} from "./electrobunBridge"

describe("electrobunBridge", () => {
  const originalElectrobunFlag = window.__ELECTROBUN__
  const originalShowConfirm = window.__electrobunShowConfirm
  const originalShowError = window.__electrobunShowError
  const originalStorageGet = window.__electrobunStorageGet
  const originalStorageSet = window.__electrobunStorageSet
  const originalStorageRemove = window.__electrobunStorageRemove
  const originalStorageClear = window.__electrobunStorageClear

  afterEach(() => {
    window.__ELECTROBUN__ = originalElectrobunFlag
    window.__electrobunShowConfirm = originalShowConfirm
    window.__electrobunShowError = originalShowError
    window.__electrobunStorageGet = originalStorageGet
    window.__electrobunStorageSet = originalStorageSet
    window.__electrobunStorageRemove = originalStorageRemove
    window.__electrobunStorageClear = originalStorageClear
    vi.restoreAllMocks()
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
    const nativeConfirm = vi.fn().mockResolvedValue(true)
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
    const nativeConfirm = vi.fn().mockResolvedValue(true)
    window.__electrobunShowConfirm = nativeConfirm

    const confirmed = await showNativeConfirm("Resume", "Continue?", "Yes", "No")

    expect(confirmed).toBe(true)
    expect(nativeConfirm).toHaveBeenCalledWith("Resume", "Continue?", "Yes", "No")
  })

  test("returns without calling the native error bridge when Electrobun is not active", async () => {
    window.__ELECTROBUN__ = false
    const nativeError = vi.fn().mockResolvedValue(undefined)
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
    const nativeError = vi.fn().mockResolvedValue(undefined)
    window.__electrobunShowError = nativeError

    await showNativeError("Error", "Failure")

    expect(nativeError).toHaveBeenCalledWith("Error", "Failure")
  })

  test("returns null from storageGet when Electrobun is not active", async () => {
    window.__ELECTROBUN__ = false
    const bridgeGet = vi.fn().mockResolvedValue("value")
    window.__electrobunStorageGet = bridgeGet

    const value = await storageGet("root-v1")

    expect(value).toBeNull()
    expect(bridgeGet).not.toHaveBeenCalled()
  })

  test("returns null from storageGet when the bridge is unavailable", async () => {
    window.__ELECTROBUN__ = true
    window.__electrobunStorageGet = undefined

    await expect(storageGet("root-v1")).resolves.toBeNull()
  })

  test("passes the key to the Electrobun storageGet bridge", async () => {
    window.__ELECTROBUN__ = true
    const bridgeGet = vi.fn().mockResolvedValue('{"x":1}')
    window.__electrobunStorageGet = bridgeGet

    const value = await storageGet("root-v1")

    expect(value).toBe('{"x":1}')
    expect(bridgeGet).toHaveBeenCalledWith("root-v1")
  })

  test("no-ops storageSet when Electrobun is not active", async () => {
    window.__ELECTROBUN__ = false
    const bridgeSet = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageSet = bridgeSet

    await storageSet("root-v1", "value")

    expect(bridgeSet).not.toHaveBeenCalled()
  })

  test("passes key and value to the Electrobun storageSet bridge", async () => {
    window.__ELECTROBUN__ = true
    const bridgeSet = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageSet = bridgeSet

    await storageSet("root-v1", '{"x":1}')

    expect(bridgeSet).toHaveBeenCalledWith("root-v1", '{"x":1}')
  })

  test("passes the key to the Electrobun storageRemove bridge", async () => {
    window.__ELECTROBUN__ = true
    const bridgeRemove = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageRemove = bridgeRemove

    await storageRemove("root-v1")

    expect(bridgeRemove).toHaveBeenCalledWith("root-v1")
  })

  test("calls the Electrobun storageClear bridge", async () => {
    window.__ELECTROBUN__ = true
    const bridgeClear = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageClear = bridgeClear

    await storageClear()

    expect(bridgeClear).toHaveBeenCalledWith()
  })
})
