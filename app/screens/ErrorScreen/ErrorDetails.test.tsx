import { beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playPressResetButton,
  playResetButtonIsVisible,
} from "./errorDetailsPlay"

const BoxMock = jest.fn(({ children }: { children?: ReactNode }) => <div>{children}</div>)

mock.module("@/components/Box/Box", () => ({
  Box: (props: { children?: ReactNode; flex?: number; testID?: string }) => BoxMock(props),
}))

mock.module("@/components/Button/Button", () => ({
  Button: ({ onPress, testID }: { onPress?: () => void; testID?: string }) => (
    <button type="button" data-testid={testID} onClick={onPress}>
      Reset
    </button>
  ),
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ tx }: { tx?: string }) => <h1>{tx}</h1>,
}))

mock.module("@/components/RootContainer/RootContainer", () => ({
  RootContainer: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID}>{children}</div>
  ),
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({
    children,
    selectable: _,
  }: {
    children?: ReactNode
    selectable?: boolean
    style?: unknown
  }) => <span>{children}</span>,
}))

mock.module("@/components/VStack/VStack", () => ({
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let ErrorDetails: typeof import("@/screens/ErrorScreen/ErrorDetails").ErrorDetails

beforeEach(async () => {
  BoxMock.mockClear()
  jest.clearAllMocks()
  ;({ ErrorDetails } = await import("@/screens/ErrorScreen/ErrorDetails"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ErrorDetails", () => {
  test("reset button is visible", async () => {
    const onReset = jest.fn()
    const { container } = render(
      <ErrorDetails
        error={new Error("Something went wrong")}
        errorInfo={{ componentStack: "at TestComponent" } as any}
        onReset={onReset}
      />,
    )

    await playResetButtonIsVisible({ canvasElement: container })
  })

  test("scroll wrapper uses flex:1 so button stays visible on screen", async () => {
    BoxMock.mockClear()

    render(
      <ErrorDetails
        error={new Error("Something went wrong")}
        errorInfo={{ componentStack: "at TestComponent" } as any}
        onReset={jest.fn()}
      />,
    )

    // Box should have been called at all
    expect(BoxMock.mock.calls.length).toBeGreaterThan(0)

    // At least one call should have flex=1 for the constrained scroll area
    const flexCalls = BoxMock.mock.calls.filter(
      (args) => (args[0] as { flex?: unknown }).flex === 1,
    )
    expect(flexCalls.length).toBeGreaterThan(0)
  })

  test("pressing reset button calls onReset", async () => {
    const onReset = jest.fn()
    const { container } = render(
      <ErrorDetails
        error={new Error("Something went wrong")}
        errorInfo={{ componentStack: "at TestComponent" } as any}
        onReset={onReset}
      />,
    )

    await playPressResetButton({ canvasElement: container })

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
