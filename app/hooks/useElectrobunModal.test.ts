import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

const useModalMock = vi.fn()

vi.doMock("react-native-modalfy", () => ({
  useModal: () => useModalMock(),
  modalfy: vi.fn(),
}))

vi.doMock("@/i18n", () => ({
  translate: (key: string) => key,
}))

describe("useElectrobunModal", () => {
  const passthroughOpenModal = vi.fn()
  const originalElectrobunFlag = window.__ELECTROBUN__
  const originalShowConfirm = window.__electrobunShowConfirm
  const originalShowError = window.__electrobunShowError

  beforeEach(() => {
    vi.clearAllMocks()
    useModalMock.mockReturnValue({
      openModal: passthroughOpenModal,
      closeModal: vi.fn(),
    })
    window.__ELECTROBUN__ = false
    window.__electrobunShowConfirm = undefined
    window.__electrobunShowError = undefined
  })

  afterEach(() => {
    window.__ELECTROBUN__ = originalElectrobunFlag
    window.__electrobunShowConfirm = originalShowConfirm
    window.__electrobunShowError = originalShowError
    vi.restoreAllMocks()
  })

  test("returns the original modalfy modal object outside Electrobun", async () => {
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    expect(result.current.openModal).toBe(passthroughOpenModal)
  })

  test("keeps the returned object stable across re-renders", async () => {
    window.__ELECTROBUN__ = true
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result, rerender } = renderHook(() => useElectrobunModal())
    const first = result.current

    rerender()
    rerender()

    expect(result.current).toBe(first)
    expect(result.current.openModal).toBe(first.openModal)
  })

  // Electrobun のネイティブダイアログは RPC ハンドラ内で呼ぶとデッドロックし、
  // 再開確認が返らないままビューアが黒画面になる。Web モーダルへ流すことを固定する。
  test("routes ConfirmModal to modalfy even inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const showNativeConfirmMock = vi.fn().mockResolvedValue(true)
    window.__electrobunShowConfirm = showNativeConfirmMock
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ConfirmModal", {
      titleTx: "modal.resumeReadingConfirmModal.title",
      messageTx: "modal.resumeReadingConfirmModal.message",
      okTx: "common.yes",
      cancelTx: "common.no",
      onOKPress: vi.fn(),
      onCancelPress: vi.fn(),
    })

    expect(showNativeConfirmMock).not.toHaveBeenCalled()
    expect(passthroughOpenModal).toHaveBeenCalledWith("ConfirmModal", {
      titleTx: "modal.resumeReadingConfirmModal.title",
      messageTx: "modal.resumeReadingConfirmModal.message",
      okTx: "common.yes",
      cancelTx: "common.no",
      onOKPress: expect.any(Function),
      onCancelPress: expect.any(Function),
    })
  })

  test("routes ErrorModal to modalfy even inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const showNativeErrorMock = vi.fn().mockResolvedValue(undefined)
    window.__electrobunShowError = showNativeErrorMock
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ErrorModal", {
      titleTx: "common.error",
      message: "Failed to update rating.",
    })

    expect(showNativeErrorMock).not.toHaveBeenCalled()
    expect(passthroughOpenModal).toHaveBeenCalledWith("ErrorModal", {
      titleTx: "common.error",
      message: "Failed to update rating.",
    })
  })

  test("passes non-intercepted modals through to modalfy inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ViewerRatingModal", {
      initialRating: 4,
      onSubmit: async () => {},
    })

    expect(passthroughOpenModal).toHaveBeenCalledWith("ViewerRatingModal", {
      initialRating: 4,
      onSubmit: expect.any(Function),
    })
  })
})
