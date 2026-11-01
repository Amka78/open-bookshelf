import { act, fireEvent, render, screen } from "@testing-library/react"
import {
  afterEach,
  beforeEach,
  describe as baseDescribe,
  expect,
  test as baseTest,
  vi,
} from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const openModalMock = vi.fn()
const resetAppToConnectMock = vi.fn()
const navigateToConnectMock = vi.fn()

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({ openModal: openModalMock }),
}))

vi.doMock("@/theme", () => ({
  usePalette: () => ({ bg0: "#ffffff" }),
}))

vi.doMock("@/screens/ErrorScreen/resetApp", () => ({
  resetAppToConnect: resetAppToConnectMock,
  navigateToConnect: navigateToConnectMock,
}))

vi.doMock("@/screens/ErrorScreen/ErrorDetails", () => ({
  ErrorDetails: ({
    onReset,
    onGoToConnect,
  }: {
    onReset: () => void
    onGoToConnect?: () => void
  }) => (
    <div data-testid="error-details">
      <button data-testid="error-reset" onClick={onReset} type="button" />
      {onGoToConnect ? (
        <button data-testid="error-connect" onClick={onGoToConnect} type="button" />
      ) : null}
    </div>
  ),
}))

type ConfirmParams = {
  messageTx?: string
  onOKPress?: () => void
  onCancelPress?: () => void
  onDismiss?: () => void
}

let ViewerErrorBoundary: typeof import("./ViewerErrorBoundary").ViewerErrorBoundary
let consoleErrorSpy: ReturnType<typeof vi.spyOn>

function BrokenChild() {
  throw new Error("boom")
}

function renderBoundary(onBackToLibrary = vi.fn()) {
  render(
    <ViewerErrorBoundary onBackToLibrary={onBackToLibrary}>
      <BrokenChild />
    </ViewerErrorBoundary>,
  )

  return onBackToLibrary
}

function getConfirmParams(): ConfirmParams {
  return openModalMock.mock.calls[0][1] as ConfirmParams
}

beforeEach(async () => {
  vi.clearAllMocks()
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  ;({ ViewerErrorBoundary } = await import("./ViewerErrorBoundary"))
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ViewerErrorBoundary", () => {
  test("asks whether to return to the library when a child throws", () => {
    renderBoundary()

    expect(openModalMock).toHaveBeenCalledTimes(1)
    expect(openModalMock.mock.calls[0][0]).toBe("ConfirmModal")
    expect(getConfirmParams().messageTx).toBe("errorScreen.viewerErrorPrompt")
    expect(getConfirmParams().onDismiss).toBeTypeOf("function")
  })

  test("returns to the library when the confirmation is accepted", () => {
    const onBackToLibrary = renderBoundary()

    act(() => {
      getConfirmParams().onOKPress?.()
    })

    expect(onBackToLibrary).toHaveBeenCalledTimes(1)
  })

  test("shows the error screen when the confirmation is cancelled", () => {
    renderBoundary()

    act(() => {
      getConfirmParams().onCancelPress?.()
    })

    expect(screen.getByTestId("error-details")).toBeTruthy()
  })

  test("shows the error screen when the confirmation is dismissed", () => {
    renderBoundary()

    act(() => {
      getConfirmParams().onDismiss?.()
    })

    expect(screen.getByTestId("error-details")).toBeTruthy()
  })

  test("moves to Connect from the error screen without clearing stored data", () => {
    renderBoundary()

    act(() => {
      getConfirmParams().onCancelPress?.()
    })
    fireEvent.click(screen.getByTestId("error-connect"))

    expect(navigateToConnectMock).toHaveBeenCalledTimes(1)
    expect(resetAppToConnectMock).not.toHaveBeenCalled()
  })

  test("resets the app from the error screen", () => {
    renderBoundary()

    act(() => {
      getConfirmParams().onCancelPress?.()
    })
    fireEvent.click(screen.getByTestId("error-reset"))

    expect(resetAppToConnectMock).toHaveBeenCalledTimes(1)
  })
})
