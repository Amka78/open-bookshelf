import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  vi,
} from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playCalibreRootPressesLibrary,
  playCalibreRootShowsLibraryNames,
} from "./calibreRootScreenStoryPlay"

const mockedUseStores = useStores as unknown as vi.Mock
const mockedUseNavigation = useNavigation as unknown as vi.Mock
const useElectrobunModalMock = vi.fn()

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useElectrobunModalMock(),
}))

vi.doMock("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

vi.doMock("react-native", () => ({
  ...(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock,
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  ListItem: ({
    LeftComponent,
    onPress,
  }: {
    LeftComponent?: ReactNode
    onPress?: () => void
  }) => (
    // 実 ListItem は testID を TouchableOpacity（＝クリック可能要素そのもの）に載せる。
    // mock を div > button の入れ子にすると play のクリック対象が実装とずれる。
    <button data-testid="calibre-root-item" onClick={onPress} type="button">
      {LeftComponent}
    </button>
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
}
;(global as { __componentsMock?: Record<string, unknown> }).__componentsMock = componentsMock

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

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
  const navigate = vi.fn()
  const setLibrary = vi.fn()

  beforeAll(async () => {
    ;({ CalibreRootScreen } = await import("./CalibreRootScreen"))
  })

  beforeEach(() => {
    vi.clearAllMocks()
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
