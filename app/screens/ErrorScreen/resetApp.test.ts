import { vi, describe as baseDescribe, test as baseTest, beforeEach, expect } from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const storageClearMock = vi.fn()
const resetRootMock = vi.fn()
const isNavigationReadyMock = vi.fn()

vi.doMock("@/utils/storage", () => ({
  clear: () => storageClearMock(),
}))

vi.doMock("@/navigators", () => ({
  isNavigationReady: () => isNavigationReadyMock(),
  resetRoot: (params: unknown) => resetRootMock(params),
}))

let resetAppToConnect: typeof import("./resetApp").resetAppToConnect

beforeEach(async () => {
  vi.clearAllMocks()
  storageClearMock.mockReset()
  resetRootMock.mockReset()
  isNavigationReadyMock.mockReset()
  ;({ resetAppToConnect } = await import("./resetApp"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("resetAppToConnect", () => {
  test("clears all cache before resetting navigation", async () => {
    isNavigationReadyMock.mockReturnValue(true)

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 2 })

    expect(storageClearMock).toHaveBeenCalledTimes(1)
    expect(resetRootMock).toHaveBeenCalledWith({
      index: 0,
      routes: [{ key: "connect-reset", name: "Connect" }],
    })
  })

  test("retries until navigation becomes ready", async () => {
    isNavigationReadyMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true)

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 5 })

    expect(resetRootMock).toHaveBeenCalledTimes(1)
  })

  test("does not reset root when navigation never becomes ready", async () => {
    isNavigationReadyMock.mockReturnValue(false)

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 3 })

    expect(resetRootMock).not.toHaveBeenCalled()
  })
})
