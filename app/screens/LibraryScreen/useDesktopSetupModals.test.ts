import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const openModalMock = vi.fn()
const initializeMock = vi.fn()
const state = {
  baseUrl: "",
  isLarge: true,
  libraryCount: 0,
  selectedLibrary: undefined as unknown,
  currentModal: null as string | null,
}

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    currentModal: state.currentModal,
    openModal: openModalMock,
  }),
}))

vi.doMock("@/hooks/useConvergence", () => ({
  useConvergence: () => ({
    isDesktop: true,
    isLarge: state.isLarge,
    orientation: "horizontal",
  }),
}))

vi.doMock("@/models", () => ({
  useStores: () => ({
    calibreRootStore: {
      initialize: initializeMock,
      libraryMap: { size: state.libraryCount },
      selectedLibrary: state.selectedLibrary,
    },
    settingStore: {
      api: { baseUrl: state.baseUrl },
    },
  }),
}))

let useDesktopSetupModals: typeof import("./useDesktopSetupModals").useDesktopSetupModals

beforeEach(async () => {
  vi.clearAllMocks()
  state.baseUrl = ""
  state.isLarge = true
  state.libraryCount = 0
  state.selectedLibrary = undefined
  state.currentModal = null
  initializeMock.mockResolvedValue(true)
  ;({ useDesktopSetupModals } = await import("./useDesktopSetupModals"))
})

const flushEffect = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("useDesktopSetupModals", () => {
  test("opens the connect modal when no base URL is configured", async () => {
    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(openModalMock).toHaveBeenCalledWith("ConnectModal", {})
  })

  test("initializes the Calibre connection when libraries are not loaded yet", async () => {
    state.baseUrl = "http://localhost:8080"

    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(initializeMock).toHaveBeenCalledTimes(1)
    expect(openModalMock).not.toHaveBeenCalled()
  })

  test("does not initialize while a modal is open", async () => {
    state.baseUrl = "http://localhost:8080"
    state.currentModal = "LoginModal"

    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(initializeMock).not.toHaveBeenCalled()
  })

  test("initializes once even when authentication keeps the modal open", async () => {
    state.baseUrl = "http://localhost:8080"
    initializeMock.mockResolvedValue(false)

    const { rerender } = renderHook(() => useDesktopSetupModals())
    await flushEffect()
    expect(initializeMock).toHaveBeenCalledTimes(1)

    // 401 で LoginModal が開き、モーダルの context が更新され続ける状況
    state.currentModal = "LoginModal"
    rerender()
    await flushEffect()
    rerender()
    await flushEffect()
    rerender()
    await flushEffect()

    expect(initializeMock).toHaveBeenCalledTimes(1)
  })

  test("does not auto-initialize after connecting from an empty base URL", async () => {
    const { rerender } = renderHook(() => useDesktopSetupModals())
    await flushEffect()
    expect(openModalMock).toHaveBeenCalledWith("ConnectModal", {})

    // ConnectModal で URL を入力して 401 になった直後の状態
    state.baseUrl = "http://localhost:8080"
    state.currentModal = "LoginModal"
    rerender()
    await flushEffect()
    rerender()
    await flushEffect()

    expect(initializeMock).not.toHaveBeenCalled()
  })

  test("opens the library selection modal when libraries are loaded", async () => {
    state.baseUrl = "http://localhost:8080"
    state.libraryCount = 2

    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(openModalMock).toHaveBeenCalledWith("CalibreRootModal", {})
  })

  test("does nothing when a library is already selected", async () => {
    state.baseUrl = "http://localhost:8080"
    state.libraryCount = 2
    state.selectedLibrary = { id: "library-1" }

    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(openModalMock).not.toHaveBeenCalled()
  })

  test("does nothing on mobile", async () => {
    state.isLarge = false

    renderHook(() => useDesktopSetupModals())
    await flushEffect()

    expect(openModalMock).not.toHaveBeenCalled()
    expect(initializeMock).not.toHaveBeenCalled()
  })
})
