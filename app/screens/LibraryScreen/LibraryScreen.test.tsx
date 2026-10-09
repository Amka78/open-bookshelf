import { vi, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = vi.fn()
const useConvergenceMock = vi.fn()
const bookListItemProps: Array<Record<string, unknown>> = []
const bookImageItemProps: Array<Record<string, unknown>> = []
const libraryTableItemProps: Array<Record<string, unknown>> = []
const navigationMock = {
  goBack: vi.fn(),
  navigate: vi.fn(),
  setOptions: vi.fn(),
}
const gluestackComponent = ({ children }: { children?: ReactNode }) => <div>{children}</div>
const gluestackMock = {
  Box: gluestackComponent,
  Button: gluestackComponent,
  ButtonSpinner: gluestackComponent,
  ButtonText: gluestackComponent,
  Center: gluestackComponent,
  ChevronDownIcon: gluestackComponent,
  HStack: gluestackComponent,
  Heading: gluestackComponent,
  Image: gluestackComponent,
  Input: gluestackComponent,
  InputField: gluestackComponent,
  Menu: gluestackComponent,
  MenuItem: gluestackComponent,
  MenuItemLabel: gluestackComponent,
  Modal: gluestackComponent,
  ModalBody: gluestackComponent,
  ModalCloseButton: gluestackComponent,
  ModalContent: gluestackComponent,
  ModalFooter: gluestackComponent,
  ModalHeader: gluestackComponent,
  Popover: gluestackComponent,
  PopoverBackdrop: gluestackComponent,
  PopoverBody: gluestackComponent,
  PopoverContent: gluestackComponent,
  Pressable: gluestackComponent,
  ScrollView: gluestackComponent,
  Slider: gluestackComponent,
  SliderFilledTrack: gluestackComponent,
  SliderThumb: gluestackComponent,
  SliderTrack: gluestackComponent,
  Spinner: gluestackComponent,
  Switch: gluestackComponent,
  Text: gluestackComponent,
  Tooltip: gluestackComponent,
  TooltipContent: gluestackComponent,
  TooltipText: gluestackComponent,
  VStack: gluestackComponent,
  View: gluestackComponent,
  styled: (component: unknown) => component,
  useBreakpointValue: (values: { base?: boolean; lg?: boolean; xl?: boolean }) => values.base,
}
const componentsMock = {
  BookImageItem: (props: Record<string, unknown>) => {
    bookImageItemProps.push(props)
    return <div data-testid="library-grid-item" />
  },
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Button: ({ children }: { children?: ReactNode }) => <button type="button">{children}</button>,
  FlatList: ({
    data,
    ListHeaderComponent,
    numColumns,
    renderItem,
  }: {
    data: Array<unknown>
    ListHeaderComponent?: ReactNode
    numColumns?: number
    renderItem: (params: { item: unknown }) => ReactNode
  }) =>
    numColumns && numColumns > 0 ? (
      <div data-num-columns={String(numColumns)} data-testid="library-flat-list">
        {ListHeaderComponent}
        {data.map((item, index) => (
          <div key={index}>{renderItem({ item })}</div>
        ))}
      </div>
    ) : (
      <div data-num-columns={String(numColumns)} data-testid="library-flat-list-empty" />
    ),
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  IconButton: ({ children }: { children?: ReactNode }) => <button type="button">{children}</button>,
  Image: () => <img alt="" />,
  LeftSideMenu: () => null,
  LibraryActions: () => <div data-testid="library-actions" />,
  MaterialCommunityIcon: () => <span data-testid="mock-icon" />,
  ScrollView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SelectionActionBar: () => <div data-testid="selection-action-bar" />,
  SortMenu: () => null,
  StaggerContainer: ({ children, menus }: { children?: ReactNode; menus?: ReactNode }) => (
    <div>
      {children}
      {menus}
    </div>
  ),
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  VirtualLibraryButton: () => null,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}

vi.doMock("@/models", () => ({
  useStores: useStoresMock,
}))

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

vi.doMock("@/components/BookListItem", () => ({
  BookListItem: (props: Record<string, unknown>) => {
    bookListItemProps.push(props)
    return <div data-testid="library-list-item" />
  },
}))
vi.doMock("/home/amka78/private/open-bookshelf/app/components/BookListItem/index.ts", () => ({
  BookListItem: (props: Record<string, unknown>) => {
    bookListItemProps.push(props)
    return <div data-testid="library-list-item" />
  },
}))

vi.doMock("@/components/SearchInputField", () => ({
  SearchInputField: () => <div data-testid="library-search-input" />,
}))
vi.doMock("/home/amka78/private/open-bookshelf/app/components/SearchInputField/index.ts", () => ({
  SearchInputField: () => <div data-testid="library-search-input" />,
}))
vi.doMock("@/components/Box/Box", () => ({
  Box: componentsMock.Box,
}))
vi.doMock("@/components/Button/Button", () => ({
  Button: componentsMock.Button,
}))
vi.doMock("@/components/HStack/HStack", () => ({
  HStack: componentsMock.HStack,
}))
vi.doMock("@/components/IconButton/IconButton", () => ({
  IconButton: componentsMock.IconButton,
}))
vi.doMock("@/components/Image/Image", () => ({
  Image: componentsMock.Image,
}))
vi.doMock("@/components/MaterialCommunityIcon/MaterialCommunityIcon", () => ({
  MaterialCommunityIcon: componentsMock.MaterialCommunityIcon,
}))
vi.doMock("@/components/Pressable/Pressable", () => ({
  Pressable: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))
vi.doMock("@/components/Text/Text", () => ({
  Text: componentsMock.Text,
}))
vi.doMock("@/components/VStack/VStack", () => ({
  VStack: componentsMock.VStack,
}))
vi.doMock("@/components/ScrollView/ScrollView", () => ({
  ScrollView: componentsMock.ScrollView,
}))
vi.doMock("./LibraryTableItem", () => ({
  clampColumnWidth: (width: number) => width,
  computeLibraryTableMinWidth: () => 700,
  createLibraryTableFieldLabels: () => ({
    actions: "Actions",
    authors: "Authors",
    book: "Book",
    publisher: "Publisher",
    series: "Series",
    tags: "Tags",
    title: "Title",
  }),
  DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS: {
    authors: 180,
    publisher: 150,
    series: 150,
    tags: 180,
    title: 180,
  },
  LibraryTableHeader: () => <div data-testid="library-table-header" />,
  LibraryTableItem: (props: Record<string, unknown>) => {
    libraryTableItemProps.push(props)
    return <div data-testid="library-table-item" />
  },
  LIBRARY_TABLE_MIN_WIDTH: 700,
}))

vi.doMock("@/hooks/useBulkDownloadBooks", () => ({
  useBulkDownloadBooks: () => ({
    execute: vi.fn(),
  }),
}))

vi.doMock("@/hooks/useConvergence", () => ({
  useConvergence: useConvergenceMock,
}))

vi.doMock("@/hooks/useDeleteBook", () => ({
  useDeleteBook: () => ({
    execute: vi.fn(),
  }),
}))

vi.doMock("@/hooks/useDownloadBook", () => ({
  useDownloadBook: () => ({
    execute: vi.fn(),
  }),
}))

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    closeModal: vi.fn(),
    openModal: vi.fn(),
  }),
}))

vi.doMock("@/hooks/useOpenViewer", () => ({
  useOpenViewer: () => ({
    execute: vi.fn(),
  }),
}))

vi.doMock("@/services/api", () => ({
  api: {
    deleteBooks: vi.fn(),
    getAuthHeaders: () => undefined,
    getAuthStateVersion: () => 0,
    getBookThumbnailUrl: (bookId: number, libraryId: string, size?: string) =>
      `thumb:${libraryId}:${bookId}:${size ?? "default"}`,
    subscribeAuthState: () => () => {},
    uploadFile: vi.fn(),
  },
}))

vi.doMock("@/utils/bookImageCache", () => ({
  deleteCachedBookImages: vi.fn(),
}))

vi.doMock("@react-navigation/native", () => ({
  useIsFocused: () => true,
  useNavigation: () => navigationMock,
}))

vi.doMock("@gluestack-ui/themed", () => gluestackMock)
vi.doMock(
  "/home/amka78/private/open-bookshelf/node_modules/@gluestack-ui/themed/build/index.js",
  () => gluestackMock,
)

vi.doMock("mobx-react-lite", () => ({
  observer: <T extends (...args: never[]) => unknown>(component: T) => component,
}))

vi.doMock("react-native", () => ({
  Platform: { OS: "ios" },
  useWindowDimensions: () => ({ fontScale: 1, height: 800, scale: 1, width: 200 }),
}))

let LibraryScreen: typeof import("./LibraryScreen").LibraryScreen

beforeAll(async () => {
  ;({ LibraryScreen } = await import("./LibraryScreen"))
})

function buildSelectedLibrary() {
  return {
    addSavedSearch: vi.fn(),
    books: new Map([
      [
        "1",
        {
          id: 1,
          metaData: {
            authors: [],
            formats: [],
            series: null,
            tags: [],
            title: "Dune",
          },
        },
      ],
      [
        "2",
        {
          id: 2,
          metaData: {
            authors: [],
            formats: [],
            series: null,
            tags: [],
            title: "Neuromancer",
          },
        },
      ],
    ]),
    ftsEnabled: false,
    id: "test-library",
    fieldMetadataList: new Map([
      [
        "authors",
        {
          searchTerms: ["authors"],
        },
      ],
    ]),
    savedSearches: [],
    searchSetting: {
      query: "",
      setProp: vi.fn(),
      sort: "title",
      sortOrder: "asc",
      vl: null,
    },
    selectedBook: null,
    setBook: vi.fn(),
    sortField: [],
    tagBrowser: [],
    virtualLibraries: [],
  }
}

function renderLibraryScreen({
  viewMode = "list",
}: {
  viewMode?: "grid" | "list" | "table"
} = {}) {
  const selectedLibrary = buildSelectedLibrary()
  useConvergenceMock.mockReturnValue({
    isLarge: false,
    orientation: "vertical",
  })
  useStoresMock.mockReturnValue({
    calibreRootStore: {
      getBookThumbnailRevision: () => 0,
      getTagBrowser: vi.fn(),
      isFetchingMore: false,
      readingHistories: [],
      searchLibrary: vi.fn().mockResolvedValue(undefined),
      searchMoreLibrary: vi.fn(),
      selectedLibrary,
    },
    settingStore: {
      addRecentSearch: vi.fn(),
      booksPerPage: 20,
      getLibraryTableColumnWidths: () => ({}),
      getLibraryViewMode: () => viewMode,
      getReadStatus: () => undefined,
      recentSearches: [],
      setLibraryTableColumnWidth: vi.fn(),
      setLibraryViewMode: vi.fn(),
    },
  })

  return render(<LibraryScreen />)
}

beforeEach(() => {
  bookImageItemProps.length = 0
  bookListItemProps.length = 0
  libraryTableItemProps.length = 0
  vi.clearAllMocks()
})

describe("LibraryScreen", () => {
  test("list items use single selection when pressed", async () => {
    renderLibraryScreen({
      viewMode: "list",
    })

    const firstItem = bookListItemProps[0]
    expect(firstItem).toBeTruthy()
    expect(firstItem.onPress).toBeInstanceOf(Function)

    await act(async () => {
      await (firstItem.onPress as () => void)()
    })

    expect(screen.queryByTestId("selection-action-bar")).toBeNull()

    const latestItems = bookListItemProps.slice(-2)
    expect(latestItems.find((item) => (item.book as { id: number }).id === 1)?.isSelected).toBe(
      true,
    )
    expect(latestItems.find((item) => (item.book as { id: number }).id === 2)?.isSelected).toBe(
      false,
    )
  })

  test("list items keep previous selections after long press enters multi selection", async () => {
    renderLibraryScreen({
      viewMode: "list",
    })

    const [firstItem, secondItem] = bookListItemProps
    expect(firstItem?.onLongPress).toBeInstanceOf(Function)
    expect(secondItem?.onPress).toBeInstanceOf(Function)

    act(() => {
      ;(firstItem.onLongPress as () => void)()
    })

    expect(screen.getByTestId("selection-action-bar")).toBeTruthy()

    await act(async () => {
      await (secondItem.onPress as () => void)()
    })

    const latestItems = bookListItemProps.slice(-2)
    expect(latestItems.find((item) => (item.book as { id: number }).id === 1)?.isSelected).toBe(
      true,
    )
    expect(latestItems.find((item) => (item.book as { id: number }).id === 2)?.isSelected).toBe(
      true,
    )
  })

  test("grid items enter multi selection on long press", () => {
    renderLibraryScreen({
      viewMode: "grid",
    })

    const firstItem = bookImageItemProps[0]
    expect(firstItem?.onLongPress).toBeInstanceOf(Function)

    act(() => {
      ;(firstItem.onLongPress as () => void)()
    })

    expect(screen.getByTestId("selection-action-bar")).toBeTruthy()
  })

  test("table items enter multi selection on long press", () => {
    renderLibraryScreen({
      viewMode: "table",
    })

    const firstItem = libraryTableItemProps[0]
    expect(firstItem?.onLongPress).toBeInstanceOf(Function)

    act(() => {
      ;(firstItem.onLongPress as () => void)()
    })

    expect(screen.getByTestId("selection-action-bar")).toBeTruthy()
  })

  test("grid mode still renders a book image item on narrow screens", () => {
    renderLibraryScreen({
      viewMode: "grid",
    })

    expect(screen.getByTestId("library-flat-list").getAttribute("data-num-columns")).toBe("1")
    expect(screen.getAllByTestId("library-grid-item").length).toBeGreaterThan(0)
    expect(bookImageItemProps.length).toBeGreaterThan(0)
  })

  test("table mode renders table header and items", () => {
    renderLibraryScreen({
      viewMode: "table",
    })

    expect(screen.getByTestId("library-table-header")).toBeTruthy()
    expect(screen.getAllByTestId("library-table-item").length).toBeGreaterThan(0)
    expect(libraryTableItemProps.length).toBeGreaterThan(0)
  })
})
