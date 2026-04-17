import {
  describe as baseDescribe,
  test as baseTest,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const storageClearMock = jest.fn()
const resetRootMock = jest.fn()
const isNavigationReadyMock = jest.fn()

mock.module("@/utils/storage", () => ({
  clear: () => storageClearMock(),
}))

mock.module("@/navigators", () => ({
  isNavigationReady: () => isNavigationReadyMock(),
  resetRoot: (params: unknown) => resetRootMock(params),
}))

let resetAppToConnect: typeof import("./resetApp").resetAppToConnect

beforeEach(async () => {
  jest.clearAllMocks()
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
