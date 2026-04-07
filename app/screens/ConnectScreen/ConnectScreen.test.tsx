import { beforeAll, beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playConnectShowsButton,
  playConnectShowsDefaultUrl,
  playConnectShowsHeading,
} from "./connectScreenStoryPlay"

const useSafeAreaInsetsMock = jest.fn()

const mockedUseStores = useStores as unknown as jest.Mock
const mockedUseNavigation = useNavigation as unknown as jest.Mock

mock.module("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => useSafeAreaInsetsMock(),
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/components", () => ({
  ...(global as { __componentsMock?: Record<string, unknown> }).__componentsMock,
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Heading: ({ testID, tx }: { testID?: string; tx?: string }) => (
    <h1 data-testid={testID}>{tx === "connectScreen.welcome" ? "Welcome!!" : tx}</h1>
  ),
  Text: ({ tx }: { tx?: string }) => <span>{tx}</span>,
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  FormCheckbox: ({ "aria-label": ariaLabel }: { "aria-label"?: string }) => (
    <input aria-label={ariaLabel} type="checkbox" />
  ),
  FormInputField: ({
    defaultValue,
    placeholderTx,
  }: {
    defaultValue?: string
    placeholderTx?: string
  }) => (
    <input
      defaultValue={defaultValue}
      placeholder={placeholderTx === "connectScreen.placeHolder" ? "(http or https)://{Address}:{Port}" : placeholderTx}
    />
  ),
  Button: ({
    testID,
    tx,
    onPress,
    isDisabled,
  }: {
    testID?: string
    tx?: string
    onPress?: () => void
    isDisabled?: boolean
  }) => (
    <button data-testid={testID} disabled={isDisabled} onClick={onPress} type="button">
      {tx === "connectScreen.connect" ? "Connect" : tx}
    </button>
  ),
}))

let ConnectScreen: typeof import("./ConnectScreen").ConnectScreen

async function renderConnectScreen() {
  let result: ReturnType<typeof render> | undefined

  await act(async () => {
    result = render(<ConnectScreen />)
  })

  return result as ReturnType<typeof render>
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ConnectScreen", () => {
  const navigate = jest.fn()
  const initialize = jest.fn()
  const setConnectionSetting = jest.fn()

  beforeAll(async () => {
    ;({ ConnectScreen } = await import("./ConnectScreen"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useSafeAreaInsetsMock.mockReturnValue({ bottom: 12 })
    mockedUseNavigation.mockReturnValue({ navigate })
    mockedUseStores.mockReturnValue({
      settingStore: {
        api: {
          baseUrl: "http://localhost:8080",
        },
        setConnectionSetting,
      },
      calibreRootStore: {
        initialize,
      },
    })
  })

  test("renders the connect heading and connect button", async () => {
    const { container } = await renderConnectScreen()

    await playConnectShowsHeading({ canvasElement: container })
    await playConnectShowsButton({ canvasElement: container })
  })

  test("renders the saved base URL in the connect input field", async () => {
    const { container } = await renderConnectScreen()

    await playConnectShowsDefaultUrl({
      canvasElement: container,
      placeholder: "(http or https)://{Address}:{Port}",
      expectedValue: "http://localhost:8080",
    })
  })

  test("renders an enabled connect button when a saved URL is available", async () => {
    const { container } = await renderConnectScreen()

    const button = container.querySelector('[data-testid="connect-button"]') as HTMLButtonElement | null

    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(false)
  })

  test("renders without navigating before any connect action is submitted", async () => {
    const { container } = await renderConnectScreen()

    await playConnectShowsButton({ canvasElement: container })
    expect(navigate).not.toHaveBeenCalled()
  })
})