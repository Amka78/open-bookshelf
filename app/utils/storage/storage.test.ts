import AsyncStorage from "@react-native-async-storage/async-storage"
import { clear, load, loadString, remove, save, saveString } from "./storage"

// fixtures
const VALUE_OBJECT = { x: 1 }
const VALUE_STRING = JSON.stringify(VALUE_OBJECT)

// describe 内テストの実行前に残っている前テストの呼び出し履歴を落とす。
beforeEach(() => {
  vi.clearAllMocks()
  ;(AsyncStorage.getItem as vi.Mock).mockReturnValue(Promise.resolve(VALUE_STRING))
})

test("load", async () => {
  const value = await load("something")
  expect(value).toEqual(JSON.parse(VALUE_STRING))
})

test("loadString", async () => {
  const value = await loadString("something")
  expect(value).toEqual(VALUE_STRING)
})

test("save", async () => {
  await save("something", VALUE_OBJECT)
  expect(AsyncStorage.setItem).toHaveBeenCalledWith("something", VALUE_STRING)
})

test("saveString", async () => {
  await saveString("something", VALUE_STRING)
  expect(AsyncStorage.setItem).toHaveBeenCalledWith("something", VALUE_STRING)
})

test("remove", async () => {
  await remove("something")
  expect(AsyncStorage.removeItem).toHaveBeenCalledWith("something")
})

test("clear", async () => {
  await clear()
  expect(AsyncStorage.clear).toHaveBeenCalledWith()
})

describe("Electrobun storage", () => {
  const originalElectrobunFlag = window.__ELECTROBUN__
  const originalStorageGet = window.__electrobunStorageGet
  const originalStorageSet = window.__electrobunStorageSet
  const originalStorageRemove = window.__electrobunStorageRemove
  const originalStorageClear = window.__electrobunStorageClear

  afterEach(() => {
    window.__ELECTROBUN__ = originalElectrobunFlag
    window.__electrobunStorageGet = originalStorageGet
    window.__electrobunStorageSet = originalStorageSet
    window.__electrobunStorageRemove = originalStorageRemove
    window.__electrobunStorageClear = originalStorageClear
  })

  test("load uses the Electrobun bridge instead of AsyncStorage", async () => {
    window.__ELECTROBUN__ = true
    const bridgeGet = vi.fn().mockResolvedValue(VALUE_STRING)
    window.__electrobunStorageGet = bridgeGet

    const value = await load("something")
    expect(value).toEqual(JSON.parse(VALUE_STRING))
    expect(bridgeGet).toHaveBeenCalledWith("something")
    expect(AsyncStorage.getItem).not.toHaveBeenCalled()
  })

  test("load returns null when the Electrobun bridge value is missing", async () => {
    window.__ELECTROBUN__ = true
    window.__electrobunStorageGet = vi.fn().mockResolvedValue(null)

    await expect(load("something")).resolves.toBeNull()
  })

  test("save uses the Electrobun bridge instead of AsyncStorage", async () => {
    window.__ELECTROBUN__ = true
    const bridgeSet = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageSet = bridgeSet

    await expect(save("something", VALUE_OBJECT)).resolves.toBe(true)
    expect(bridgeSet).toHaveBeenCalledWith("something", VALUE_STRING)
    expect(AsyncStorage.setItem).not.toHaveBeenCalled()
  })

  test("saveString uses the Electrobun bridge instead of AsyncStorage", async () => {
    window.__ELECTROBUN__ = true
    const bridgeSet = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageSet = bridgeSet

    await expect(saveString("something", VALUE_STRING)).resolves.toBe(true)
    expect(bridgeSet).toHaveBeenCalledWith("something", VALUE_STRING)
  })

  test("remove uses the Electrobun bridge instead of AsyncStorage", async () => {
    window.__ELECTROBUN__ = true
    const bridgeRemove = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageRemove = bridgeRemove

    await remove("something")
    expect(bridgeRemove).toHaveBeenCalledWith("something")
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled()
  })

  test("clear uses the Electrobun bridge instead of AsyncStorage", async () => {
    window.__ELECTROBUN__ = true
    const bridgeClear = vi.fn().mockResolvedValue(undefined)
    window.__electrobunStorageClear = bridgeClear

    await clear()
    expect(bridgeClear).toHaveBeenCalledWith()
    expect(AsyncStorage.clear).not.toHaveBeenCalled()
  })
})
