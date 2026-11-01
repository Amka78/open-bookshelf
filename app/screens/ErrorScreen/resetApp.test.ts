import { vi, describe as baseDescribe, test as baseTest, beforeEach, expect } from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const storageClearMock = vi.fn()
const resetRootMock = vi.fn()
const isNavigationReadyMock = vi.fn()
const openModalMock = vi.fn()

vi.doMock("@/utils/storage", () => ({
  clear: () => storageClearMock(),
}))

vi.doMock("@/navigators", () => ({
  isNavigationReady: () => isNavigationReadyMock(),
  resetRoot: (params: unknown) => resetRootMock(params),
}))

vi.doMock("react-native-modalfy", () => ({
  modalfy: () => ({ openModal: openModalMock }),
}))

let resetAppToConnect: typeof import("./resetApp").resetAppToConnect
let navigateToConnect: typeof import("./resetApp").navigateToConnect

beforeEach(async () => {
  vi.clearAllMocks()
  storageClearMock.mockReset()
  resetRootMock.mockReset()
  isNavigationReadyMock.mockReset()
  openModalMock.mockReset()
  ;({ resetAppToConnect, navigateToConnect } = await import("./resetApp"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("resetAppToConnect", () => {
  test("clears all cache before resetting navigation", async () => {
    isNavigationReadyMock.mockReturnValue(true)

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 2, largeScreen: false })

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

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 5, largeScreen: false })

    expect(resetRootMock).toHaveBeenCalledTimes(1)
  })

  test("does not reset root when navigation never becomes ready", async () => {
    isNavigationReadyMock.mockReturnValue(false)

    await resetAppToConnect({ retryIntervalMs: 1, maxAttempts: 3, largeScreen: false })

    expect(resetRootMock).not.toHaveBeenCalled()
  })
})

describe("navigateToConnect", () => {
  test("resets navigation without clearing stored data", async () => {
    isNavigationReadyMock.mockReturnValue(true)

    await navigateToConnect({ retryIntervalMs: 1, maxAttempts: 2, largeScreen: false })

    expect(storageClearMock).not.toHaveBeenCalled()
    expect(resetRootMock).toHaveBeenCalledWith({
      index: 0,
      routes: [{ key: "connect-reset", name: "Connect" }],
    })
  })

  test("resets to Library on a large screen", async () => {
    isNavigationReadyMock.mockReturnValue(true)

    await navigateToConnect({ retryIntervalMs: 1, maxAttempts: 2, largeScreen: true })

    expect(resetRootMock).toHaveBeenCalledWith({
      index: 0,
      routes: [{ key: "library-reset", name: "Library" }],
    })
    expect(openModalMock).toHaveBeenCalledWith("ConnectModal", {})
  })

  test("retries until navigation becomes ready", async () => {
    isNavigationReadyMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true)

    await navigateToConnect({ retryIntervalMs: 1, maxAttempts: 5, largeScreen: false })

    expect(resetRootMock).toHaveBeenCalledTimes(1)
  })
})
