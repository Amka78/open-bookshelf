import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playCalibreRootPressesLibrary,
  playCalibreRootShowsLibraryNames,
} from "./calibreRootScreenStoryPlay"

const mockedUseStores = useStores as unknown as jest.Mock
const mockedUseNavigation = useNavigation as unknown as jest.Mock
const useElectrobunModalMock = jest.fn()

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useElectrobunModalMock(),
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("react-native", () => ({
  ...(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock,
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components", () => ({
  ...(global as { __componentsMock?: Record<string, unknown> }).__componentsMock,
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  ListItem: ({
    LeftComponent,
    onPress,
  }: {
    LeftComponent?: ReactNode
    onPress?: () => void
  }) => (
    <div data-testid="calibre-root-item">
      <button onClick={onPress} type="button">
        {LeftComponent}
      </button>
    </div>
  ),
  FlatList: <T,>({
    data,
    renderItem,
  }: {
    data: T[]
    renderItem: ({ item }: { item: T }) => ReactNode
  }) => (
    <div>
      {data.map((item, index) => (
        <div key={String(index)}>{renderItem({ item })}</div>
      ))}
    </div>
  ),
}))

let CalibreRootScreen: typeof import("./CalibreRootScreen").CalibreRootScreen

async function renderCalibreRootScreen() {
  let result: ReturnType<typeof render> | undefined

  await act(async () => {
    result = render(<CalibreRootScreen />)
  })

  return result as ReturnType<typeof render>
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("CalibreRootScreen", () => {
  const navigate = jest.fn()
  const setLibrary = jest.fn()

  beforeAll(async () => {
    ;({ CalibreRootScreen } = await import("./CalibreRootScreen"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseNavigation.mockReturnValue({ navigate })
    mockedUseStores.mockReturnValue({
      calibreRootStore: {
        libraryMap: new Map([
          ["library-1", { id: "library-1" }],
          ["library-2", { id: "library-2" }],
          ["library-3", { id: "library-3" }],
        ]),
        setLibrary,
      },
    })
    useElectrobunModalMock.mockReturnValue({})
  })

  test("renders each available library name in the root list", async () => {
    const { container } = await renderCalibreRootScreen()

    await playCalibreRootShowsLibraryNames({
      canvasElement: container,
      libraryNames: ["library-1", "library-2", "library-3"],
    })
  })

  test("pressing a library row selects the library and navigates to the library screen", async () => {
    const { container } = await renderCalibreRootScreen()

    await playCalibreRootPressesLibrary({
      canvasElement: container,
      libraryName: "library-2",
    })

    expect(setLibrary).toHaveBeenCalledWith("library-2")
    expect(navigate).toHaveBeenCalledWith("Library")
  })
})
