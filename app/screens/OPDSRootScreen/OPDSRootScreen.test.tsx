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
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playOPDSRootPressesEntry, playOPDSRootShowsEntries } from "./opdsRootScreenStoryPlay"

const mockedUseStores = useStores as unknown as jest.Mock
const mockedUseNavigation = useNavigation as unknown as jest.Mock
const mockedUsePalette = usePalette as unknown as jest.Mock

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("react-native", () => ({
  ...(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock,
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  ListItem: ({ LeftComponent, onPress }: { LeftComponent?: ReactNode; onPress?: () => void }) => (
    <div data-testid="opds-root-item">
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
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Image: () => <img alt="opds-icon" />,
}

;(global as { __componentsMock?: Record<string, unknown> }).__componentsMock = componentsMock

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

let OPDSRootScreen: typeof import("./OPDSRootScreen").OPDSRootScreen

async function renderOPDSRootScreen() {
  let result: ReturnType<typeof render> | undefined

  await act(async () => {
    result = render(<OPDSRootScreen />)
  })

  return result as ReturnType<typeof render>
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("OPDSRootScreen", () => {
  const navigate = jest.fn()
  const setOptions = jest.fn()
  const load = jest.fn().mockResolvedValue(undefined)

  beforeAll(async () => {
    ;({ OPDSRootScreen } = await import("./OPDSRootScreen"))
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseNavigation.mockReturnValue({ navigate, setOptions })
    mockedUsePalette.mockReturnValue({ textPrimary: "#111111" })
    mockedUseStores.mockReturnValue({
      settingStore: {
        api: {
          baseUrl: "http://catalog.example",
          initialPath: "/opds",
        },
      },
      opdsRootStore: {
        root: {
          icon: "/icon.png",
          title: "OPDS Catalog",
          entry: [
            {
              title: "Fiction",
              content: "Browse fiction books",
              link: [{ href: "/opds/fiction" }],
            },
            {
              title: "Science",
              content: "Browse science books",
              link: [{ href: "/opds/science" }],
            },
          ],
          load,
        },
      },
    })
  })

  test("renders OPDS entry titles from the root feed", async () => {
    const { container } = await renderOPDSRootScreen()

    await playOPDSRootShowsEntries({
      canvasElement: container,
      entryTitles: ["Fiction", "Science"],
    })
  })

  test("pressing an OPDS entry navigates to the acquisition screen with the selected link", async () => {
    const { container } = await renderOPDSRootScreen()

    await playOPDSRootPressesEntry({
      canvasElement: container,
      entryTitle: "Science",
    })

    expect(navigate).toHaveBeenCalledWith("Acquisition", {
      link: { href: "/opds/science" },
    })
  })
})
