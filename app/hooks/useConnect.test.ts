import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const navigateMock = vi.fn()
const setConnectionSettingMock = vi.fn()
const initializeMock = vi.fn()

const settingStore = {
  api: { baseUrl: "" },
  setConnectionSetting: setConnectionSettingMock,
}
const calibreRootStore = {
  initialize: initializeMock,
}

vi.doMock("@/models", () => ({
  useStores: () => ({ settingStore, calibreRootStore }),
}))

vi.doMock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: navigateMock }),
}))

vi.doMock("react-hook-form", () => ({
  useForm: () => ({ control: {}, handleSubmit: (fn: unknown) => fn }),
}))

let useConnect: typeof import("./useConnect").useConnect

beforeEach(async () => {
  vi.clearAllMocks()
  ;({ useConnect } = await import("./useConnect"))
})

describe("useConnect", () => {
  test("calls onConnected after a successful Calibre connection", async () => {
    initializeMock.mockResolvedValue(true)
    const onConnected = vi.fn()
    const onConnectFailed = vi.fn()
    const { result } = renderHook(() => useConnect({ onConnected, onConnectFailed }))

    await result.current.onConnectPress({ url: "http://localhost:8080", isOPDS: false })

    expect(setConnectionSettingMock).toHaveBeenCalledWith("http://localhost:8080", false)
    expect(onConnected).toHaveBeenCalledTimes(1)
    expect(onConnectFailed).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  test("calls onConnectFailed when the connection fails", async () => {
    initializeMock.mockResolvedValue(false)
    const onConnected = vi.fn()
    const onConnectFailed = vi.fn()
    const { result } = renderHook(() => useConnect({ onConnected, onConnectFailed }))

    await result.current.onConnectPress({ url: "http://localhost:8080", isOPDS: false })

    expect(onConnectFailed).toHaveBeenCalledTimes(1)
    expect(onConnected).not.toHaveBeenCalled()
  })

  test("navigates to CalibreRoot when no callbacks are provided", async () => {
    initializeMock.mockResolvedValue(true)
    const { result } = renderHook(() => useConnect())

    await result.current.onConnectPress({ url: "http://localhost:8080", isOPDS: false })

    expect(navigateMock).toHaveBeenCalledWith("CalibreRoot")
  })
})
