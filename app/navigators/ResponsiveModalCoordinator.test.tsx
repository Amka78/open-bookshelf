import { render } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const navigateMock = vi.fn()
const closeAllModalsMock = vi.fn((callback?: () => void) => {
  callback?.()
})
let openedItems: Array<{ name: string; params?: unknown }> = []
let isLarge = false

vi.doMock("@/hooks/useConvergence", () => ({
  useConvergence: () => ({ isDesktop: !isLarge, isLarge, orientation: "vertical" }),
}))

vi.doMock("react-native-modalfy", () => ({
  ModalState: {
    getState: () => ({
      stack: {
        openedItems: new Set(openedItems),
      },
    }),
  },
  useModal: () => ({
    closeAllModals: closeAllModalsMock,
    currentModal: openedItems.at(-1)?.name ?? null,
  }),
}))

vi.doMock("./navigationUtilities", () => ({
  navigationRef: {
    isReady: () => true,
    navigate: navigateMock,
  },
}))

let ResponsiveModalCoordinator: typeof import("./ResponsiveModalCoordinator").ResponsiveModalCoordinator

beforeEach(async () => {
  vi.clearAllMocks()
  openedItems = []
  isLarge = false
  ;({ ResponsiveModalCoordinator } = await import("./ResponsiveModalCoordinator"))
})

describe("ResponsiveModalCoordinator", () => {
  test("moves an open connect modal to the connect screen", () => {
    openedItems = [{ name: "ConnectModal" }]

    render(<ResponsiveModalCoordinator />)

    expect(closeAllModalsMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith("Connect", undefined)
  })

  test("converts stacked modals in order", () => {
    openedItems = [{ name: "ConnectModal" }, { name: "CalibreRootModal" }]

    render(<ResponsiveModalCoordinator />)

    expect(navigateMock.mock.calls).toEqual([
      ["Connect", undefined],
      ["CalibreRoot", undefined],
    ])
  })

  test("keeps modals open when one has no corresponding screen", () => {
    openedItems = [{ name: "ConnectModal" }, { name: "ConfirmModal" }]

    render(<ResponsiveModalCoordinator />)

    expect(closeAllModalsMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  test("does nothing on a large screen", () => {
    isLarge = true
    openedItems = [{ name: "ConnectModal" }]

    render(<ResponsiveModalCoordinator />)

    expect(closeAllModalsMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  test("does nothing when no modal is open", () => {
    render(<ResponsiveModalCoordinator />)

    expect(closeAllModalsMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
