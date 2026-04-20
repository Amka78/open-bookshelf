import { beforeAll, beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useConvergenceMock = jest.fn()
const bookListItemProps: Array<Record<string, unknown>> = []
const bookImageItemProps: Array<Record<string, unknown>> = []
const navigationMock = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setOptions: jest.fn(),
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
    numColumns,
    renderItem,
  }: {
    data: Array<unknown>
    numColumns?: number
    renderItem: (params: { item: unknown }) => ReactNode
  }) =>
    numColumns && numColumns > 0 ? (
      <div data-num-columns={String(numColumns)} data-testid="library-flat-list">
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

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

mock.module("@/components/BookListItem", () => ({
  BookListItem: (props: Record<string, unknown>) => {
    bookListItemProps.push(props)
    return <div data-testid="library-list-item" />
  },
}))
mock.module("/home/amka78/private/open-bookshelf/app/components/BookListItem/index.ts", () => ({
  BookListItem: (props: Record<string, unknown>) => {
    bookListItemProps.push(props)
    return <div data-testid="library-list-item" />
  },
}))

mock.module("@/components/SearchInputField", () => ({
  SearchInputField: () => <div data-testid="library-search-input" />,
}))
mock.module("/home/amka78/private/open-bookshelf/app/components/SearchInputField/index.ts", () => ({
  SearchInputField: () => <div data-testid="library-search-input" />,
}))
mock.module("@/components/Box/Box", () => ({
  Box: componentsMock.Box,
}))
mock.module("@/components/Button/Button", () => ({
  Button: componentsMock.Button,
}))
mock.module("@/components/HStack/HStack", () => ({
  HStack: componentsMock.HStack,
}))
mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: componentsMock.IconButton,
}))
mock.module("@/components/Image/Image", () => ({
  Image: componentsMock.Image,
}))
mock.module("@/components/MaterialCommunityIcon/MaterialCommunityIcon", () => ({
  MaterialCommunityIcon: componentsMock.MaterialCommunityIcon,
}))
mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))
mock.module("@/components/Text/Text", () => ({
  Text: componentsMock.Text,
}))
mock.module("@/components/VStack/VStack", () => ({
  VStack: componentsMock.VStack,
}))

mock.module("@/hooks/useBulkDownloadBooks", () => ({
  useBulkDownloadBooks: () => ({
    execute: jest.fn(),
  }),
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: useConvergenceMock,
}))

mock.module("@/hooks/useDeleteBook", () => ({
  useDeleteBook: () => ({
    execute: jest.fn(),
  }),
}))

mock.module("@/hooks/useDownloadBook", () => ({
  useDownloadBook: () => ({
    execute: jest.fn(),
  }),
}))

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    closeModal: jest.fn(),
    openModal: jest.fn(),
  }),
}))

mock.module("@/hooks/useOpenViewer", () => ({
  useOpenViewer: () => ({
    execute: jest.fn(),
  }),
}))

mock.module("@/services/api", () => ({
  api: {
    deleteBooks: jest.fn(),
    getAuthHeaders: () => undefined,
    getAuthStateVersion: () => 0,
    getBookThumbnailUrl: (bookId: number, libraryId: string, size?: string) =>
      `thumb:${libraryId}:${bookId}:${size ?? "default"}`,
    subscribeAuthState: () => () => {},
    uploadFile: jest.fn(),
  },
}))

mock.module("@/utils/bookImageCache", () => ({
  deleteCachedBookImages: jest.fn(),
}))

mock.module("@react-navigation/native", () => ({
  useIsFocused: () => true,
  useNavigation: () => navigationMock,
}))

mock.module("@gluestack-ui/themed", () => gluestackMock)
mock.module(
  "/home/amka78/private/open-bookshelf/node_modules/@gluestack-ui/themed/build/index.js",
  () => gluestackMock,
)

mock.module("mobx-react-lite", () => ({
  observer: <T extends (...args: never[]) => unknown>(component: T) => component,
}))

mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  useWindowDimensions: () => ({ fontScale: 1, height: 800, scale: 1, width: 200 }),
}))

let LibraryScreen: typeof import("./LibraryScreen").LibraryScreen

beforeAll(async () => {
  ;({ LibraryScreen } = await import("./LibraryScreen"))
})

function buildSelectedLibrary() {
  return {
    addSavedSearch: jest.fn(),
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
      setProp: jest.fn(),
      sort: "title",
      sortOrder: "asc",
      vl: null,
    },
    selectedBook: null,
    setBook: jest.fn(),
    sortField: [],
    tagBrowser: [],
    virtualLibraries: [],
  }
}

function renderLibraryScreen({
  viewMode = "list",
}: {
  viewMode?: "grid" | "list"
} = {}) {
  const selectedLibrary = buildSelectedLibrary()
  useConvergenceMock.mockReturnValue({
    isLarge: false,
    orientation: "vertical",
  })
  useStoresMock.mockReturnValue({
    calibreRootStore: {
      getBookThumbnailRevision: () => 0,
      getTagBrowser: jest.fn(),
      isFetchingMore: false,
      readingHistories: [],
      searchLibrary: jest.fn().mockResolvedValue(undefined),
      searchMoreLibrary: jest.fn(),
      selectedLibrary,
    },
    settingStore: {
      addRecentSearch: jest.fn(),
      booksPerPage: 20,
      getLibraryViewMode: () => viewMode,
      getReadStatus: () => undefined,
      recentSearches: [],
      setLibraryViewMode: jest.fn(),
    },
  })

  return render(<LibraryScreen />)
}

beforeEach(() => {
  bookImageItemProps.length = 0
  bookListItemProps.length = 0
  jest.clearAllMocks()
})

describe("LibraryScreen", () => {
  test("list items keep the checkbox selectable before selection mode starts", async () => {
    renderLibraryScreen({
      viewMode: "list",
    })

    const firstItem = bookListItemProps[0]
    expect(firstItem).toBeTruthy()
    expect(firstItem.onSelectToggle).toBeInstanceOf(Function)

    await act(async () => {
      ;(firstItem.onSelectToggle as () => void)()
    })

    expect(screen.getByTestId("selection-action-bar")).toBeTruthy()
  })

  test("grid mode still renders a book image item on narrow screens", () => {
    renderLibraryScreen({
      viewMode: "grid",
    })

    expect(screen.getByTestId("library-flat-list").getAttribute("data-num-columns")).toBe("1")
    expect(screen.getByTestId("library-grid-item")).toBeTruthy()
    expect(bookImageItemProps.length).toBeGreaterThan(0)
  })
})
