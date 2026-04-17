import { beforeAll, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

mock.module("@/components", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  IconButton: ({
    labelTx,
    onPress,
    testID,
    disabled,
  }: {
    labelTx?: string
    onPress?: () => void
    testID?: string
    disabled?: boolean
  }) => (
    <button data-testid={testID} disabled={disabled} type="button" onClick={onPress}>
      {labelTx}
    </button>
  ),
}))

mock.module("@/i18n", () => ({
  translate: (key: string, params?: Record<string, unknown>) =>
    key === "multiSelectBar.selectedCount" ? `${params?.count ?? 0} selected` : key,
}))

mock.module("@/theme", () => ({
  usePalette: () => ({
    surfaceStrong: "#000",
    textPrimary: "#fff",
  }),
}))

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let SelectionActionBar: typeof import("./SelectionActionBar").SelectionActionBar

beforeAll(async () => {
  ;({ SelectionActionBar } = await import("./SelectionActionBar"))
})

describe("SelectionActionBar", () => {
  test("shows the select-all-visible action when not all visible books are selected", () => {
    const { getByTestId } = render(
      <SelectionActionBar
        selectedCount={1}
        allVisibleSelected={false}
        onToggleVisibleSelection={jest.fn()}
        onBulkEdit={jest.fn()}
        onBulkDownload={jest.fn()}
        onClearSelection={jest.fn()}
      />,
    )

    expect(getByTestId("selection-action-bar-toggle-visible").textContent).toBe(
      "multiSelectBar.selectAllVisible",
    )
  })

  test("shows the clear-visible action when all visible books are selected", () => {
    const { getByTestId } = render(
      <SelectionActionBar
        selectedCount={3}
        allVisibleSelected={true}
        onToggleVisibleSelection={jest.fn()}
        onBulkEdit={jest.fn()}
        onBulkDownload={jest.fn()}
        onClearSelection={jest.fn()}
      />,
    )

    expect(getByTestId("selection-action-bar-toggle-visible").textContent).toBe(
      "multiSelectBar.clearVisibleSelection",
    )
  })

  test("calls the visible selection toggle handler when the toggle button is pressed", () => {
    const onToggleVisibleSelection = jest.fn()
    const { getByTestId } = render(
      <SelectionActionBar
        selectedCount={2}
        allVisibleSelected={false}
        onToggleVisibleSelection={onToggleVisibleSelection}
        onBulkEdit={jest.fn()}
        onBulkDownload={jest.fn()}
        onClearSelection={jest.fn()}
      />,
    )

    fireEvent.click(getByTestId("selection-action-bar-toggle-visible"))

    expect(onToggleVisibleSelection).toHaveBeenCalledTimes(1)
  })
})
