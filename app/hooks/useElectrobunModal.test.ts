import { afterEach, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { renderHook } from "@testing-library/react"

const useModalMock = jest.fn()

mock.module("react-native-modalfy", () => ({
  useModal: () => useModalMock(),
  modalfy: jest.fn(),
}))

mock.module("@/i18n", () => ({
  translate: (key: string) => key,
}))

mock.module(
  "/home/amka78/open-bookshelf/node_modules/react-native-modalfy/lib/commonjs/index.js",
  () => ({
    useModal: () => useModalMock(),
    modalfy: jest.fn(),
  }),
)

describe("useElectrobunModal", () => {
  const passthroughOpenModal = jest.fn()
  const originalElectrobunFlag = window.__ELECTROBUN__
  const originalShowConfirm = window.__electrobunShowConfirm
  const originalShowError = window.__electrobunShowError

  beforeEach(() => {
    jest.clearAllMocks()
    useModalMock.mockReturnValue({
      openModal: passthroughOpenModal,
      closeModal: jest.fn(),
    })
    window.__ELECTROBUN__ = false
    window.__electrobunShowConfirm = undefined
    window.__electrobunShowError = undefined
  })

  afterEach(() => {
    window.__ELECTROBUN__ = originalElectrobunFlag
    window.__electrobunShowConfirm = originalShowConfirm
    window.__electrobunShowError = originalShowError
    jest.restoreAllMocks()
  })

  test("returns the original modalfy modal object outside Electrobun", async () => {
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    expect(result.current.openModal).toBe(passthroughOpenModal)
  })

  test("routes ConfirmModal to the native confirm dialog inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const showNativeConfirmMock = jest.fn().mockResolvedValue(true)
    window.__electrobunShowConfirm = showNativeConfirmMock
    const onOKPress = jest.fn()
    const onCancelPress = jest.fn()
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ConfirmModal", {
      titleTx: "modal.resumeReadingConfirmModal.title",
      messageTx: "modal.resumeReadingConfirmModal.message",
      okTx: "common.yes",
      cancelTx: "common.no",
      onOKPress,
      onCancelPress,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(showNativeConfirmMock).toHaveBeenCalledWith(
      "modal.resumeReadingConfirmModal.title",
      "modal.resumeReadingConfirmModal.message",
      "common.yes",
      "common.no",
    )
    expect(onOKPress).toHaveBeenCalledTimes(1)
    expect(onCancelPress).not.toHaveBeenCalled()
    expect(passthroughOpenModal).not.toHaveBeenCalled()
  })

  test("routes a rejected native confirm choice to the cancel callback inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const showNativeConfirmMock = jest.fn().mockResolvedValue(false)
    window.__electrobunShowConfirm = showNativeConfirmMock
    const onOKPress = jest.fn()
    const onCancelPress = jest.fn()
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ConfirmModal", {
      title: "Native Confirm",
      message: "Proceed?",
      onOKPress,
      onCancelPress,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(showNativeConfirmMock).toHaveBeenCalledWith(
      "Native Confirm",
      "Proceed?",
      "common.ok",
      "common.cancel",
    )
    expect(onCancelPress).toHaveBeenCalledTimes(1)
    expect(onOKPress).not.toHaveBeenCalled()
  })

  test("routes ErrorModal to the native error dialog inside Electrobun", async () => {
    window.__ELECTROBUN__ = true
    const showNativeErrorMock = jest.fn().mockResolvedValue(undefined)
    window.__electrobunShowError = showNativeErrorMock
    const { useElectrobunModal } = await import("./useElectrobunModal")

    const { result } = renderHook(() => useElectrobunModal())

    result.current.openModal("ErrorModal", {
      titleTx: "common.error",
      message: "Failed to update rating.",
    })

    expect(showNativeErrorMock).toHaveBeenCalledWith("common.error", "Failed to update rating.")
    expect(passthroughOpenModal).not.toHaveBeenCalled()
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
