import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { useStores } from "@/models"
import { useNavigation, useRoute } from "@react-navigation/native"
import { usePalette } from "@/theme"
import { act, render, fireEvent, findByText, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

async function playAcquisitionShowsEntries({
  canvasElement,
  titles,
}: { canvasElement: HTMLElement; titles: string[] }) {
  for (const title of titles) {
    await findByText(canvasElement, title)
  }
}

async function playAcquisitionPressesEntry({
  canvasElement,
  title,
}: { canvasElement: HTMLElement; title: string }) {
  const titleNode = await findByText(canvasElement, title)
  const item = titleNode.closest('[data-testid="acquisition-item"]')
  if (!item) throw new Error(`Could not find acquisition item for title ${title}.`)
  fireEvent.click(within(item).getByRole("button"))
}

const mockedUseStores = useStores as unknown as jest.Mock
const mockedUseNavigation = useNavigation as unknown as jest.Mock
const mockedUseRoute = useRoute as unknown as jest.Mock
const mockedUsePalette = usePalette as unknown as jest.Mock

const opdsLoadMock = jest.fn()
const opdsCreateMock = jest.fn()

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("expo-image", () => ({
  Image: () => <img alt="cover" />,
}))

mock.module("@/models/opds/OpdsRootStore", () => ({
  OpdsModel: {
    create: () => opdsCreateMock(),
  },
  OpdsChildrenModel: {
    create: jest.fn(),
  },
}))

mock.module("@/components", () => ({
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Image: () => <img alt="header-icon" />,
  MaterialCommunityIcon: () => <span>icon</span>,
  ListItem: ({ LeftComponent, onPress }: { LeftComponent?: ReactNode; onPress?: () => void }) => (
    <div data-testid="acquisition-item">
      <button onClick={onPress} type="button">
        {LeftComponent}
      </button>
    </div>
  ),
  FlatList: <T,>({
    data,
    renderItem,
  }: {
    data?: T[]
    renderItem: ({ item }: { item: T }) => ReactNode
  }) => (
    <div>
      {(data ?? []).map((item, index) => (
        <div key={String(index)}>{renderItem({ item })}</div>
      ))}
    </div>
  ),
}))

let AcquisitionScreen: typeof import("./AcquisitionScreen").AcquisitionScreen

async function renderAcquisitionScreen() {
  let result: ReturnType<typeof render> | undefined

  await act(async () => {
    result = render(<AcquisitionScreen />)
  })

  return result as ReturnType<typeof render>
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("AcquisitionScreen", () => {
  const push = jest.fn()
  const setOptions = jest.fn()

  beforeAll(async () => {
    ;({ AcquisitionScreen } = await import("./AcquisitionScreen"))
  })

  beforeEach(() => {
    jest.clearAllMocks()

    opdsLoadMock.mockResolvedValue(undefined)
    opdsCreateMock.mockReturnValue({
      icon: "/icon.png",
      title: "Books",
      entry: [
        {
          title: "Nested Catalog",
          content: "More entries",
          contentType: "text",
          author: [],
          link: [{ href: "/opds/sub" }],
        },
        {
          title: "Book A",
          content: "",
          contentType: "application/epub+zip",
          author: [{ name: "Author One" }, { name: "Author Two" }],
          link: [{ href: "/download/book-a" }],
        },
      ],
      link: [{ rel: "next", href: "/opds/next" }],
      load: opdsLoadMock,
    })

    mockedUsePalette.mockReturnValue({ textPrimary: "#111111" })
    mockedUseNavigation.mockReturnValue({ push, setOptions })
    mockedUseRoute.mockReturnValue({ params: { link: { href: "/opds/root" } } })
    mockedUseStores.mockReturnValue({
      settingStore: {
        api: {
          baseUrl: "http://catalog.example",
        },
      },
      opdsRootStore: {
        children: [],
      },
    })
  })

  test("renders loaded acquisition entries from the selected OPDS link", async () => {
    const { container } = await renderAcquisitionScreen()

    await playAcquisitionShowsEntries({
      canvasElement: container,
      titles: ["Nested Catalog", "Book A"],
    })
  })

  test("pressing a text entry pushes the next acquisition screen with the linked feed", async () => {
    const { container } = await renderAcquisitionScreen()

    await playAcquisitionPressesEntry({
      canvasElement: container,
      title: "Nested Catalog",
    })

    expect(push).toHaveBeenCalledWith("Acquisition", {
      link: { href: "/opds/sub" },
    })
  })

  test("pressing a book entry does not push another acquisition screen", async () => {
    const { container } = await renderAcquisitionScreen()

    await playAcquisitionPressesEntry({
      canvasElement: container,
      title: "Book A",
    })

    expect(push).not.toHaveBeenCalled()
  })
})
