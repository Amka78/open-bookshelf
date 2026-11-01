import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const openModalMock = vi.fn()
const initializeMock = vi.fn()
const state = {
  baseUrl: "",
  isLarge: true,
  libraryCount: 0,
  selectedLibrary: undefined as unknown,
}

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    currentModal: null,
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
  initializeMock.mockResolvedValue(true)
  ;({ useDesktopSetupModals } = await import("./useDesktopSetupModals"))
})

describe("useDesktopSetupModals", () => {
  test("opens the connect modal when no base URL is configured", () => {
    renderHook(() => useDesktopSetupModals())

    expect(openModalMock).toHaveBeenCalledWith("ConnectModal", {})
  })

  test("initializes the Calibre connection when libraries are not loaded yet", () => {
    state.baseUrl = "http://localhost:8080"

    renderHook(() => useDesktopSetupModals())

    expect(initializeMock).toHaveBeenCalledTimes(1)
    expect(openModalMock).not.toHaveBeenCalled()
  })

  test("opens the library selection modal when libraries are loaded", () => {
    state.baseUrl = "http://localhost:8080"
    state.libraryCount = 2

    renderHook(() => useDesktopSetupModals())

    expect(openModalMock).toHaveBeenCalledWith("CalibreRootModal", {})
  })

  test("does nothing when a library is already selected", () => {
    state.baseUrl = "http://localhost:8080"
    state.libraryCount = 2
    state.selectedLibrary = { id: "library-1" }

    renderHook(() => useDesktopSetupModals())

    expect(openModalMock).not.toHaveBeenCalled()
  })

  test("does nothing on mobile", () => {
    state.isLarge = false

    renderHook(() => useDesktopSetupModals())

    expect(openModalMock).not.toHaveBeenCalled()
    expect(initializeMock).not.toHaveBeenCalled()
  })
})
