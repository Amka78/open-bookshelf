import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useIsFocusedMock = jest.fn()
const useConvergenceMock = jest.fn()
const useOpenViewerMock = jest.fn()
const useDeleteBookMock = jest.fn()
const useDownloadBookMock = jest.fn()
const useBulkDownloadBooksMock = jest.fn()
const useElectrobunModalMock = jest.fn()
const useLibraryMock = jest.fn()

const bookImageItemSources: unknown[] = []

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

mock.module("@/models", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: () => useNavigationMock(),
  useIsFocused: () => useIsFocusedMock(),
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

mock.module("@/hooks/useOpenViewer", () => ({
  useOpenViewer: () => useOpenViewerMock(),
}))

mock.module("@/hooks/useDeleteBook", () => ({
  useDeleteBook: () => useDeleteBookMock(),
}))

mock.module("@/hooks/useDownloadBook", () => ({
  useDownloadBook: () => useDownloadBookMock(),
}))

mock.module("@/hooks/useBulkDownloadBooks", () => ({
  useBulkDownloadBooks: () => useBulkDownloadBooksMock(),
}))

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => useElectrobunModalMock(),
}))

mock.module("./useLibrary", () => ({
  useLibrary: () => useLibraryMock(),
}))

mock.module("@/services/api", () => ({
  api: {
    getBookThumbnailUrl: (bookId: string | number, libraryId: string) =>
      `http://example.test/library/${libraryId}/book/${bookId}/thumb`,
  },
}))

mock.module("@/utils/bookImageCache", () => ({
  deleteCachedBookImages: jest.fn(),
}))

mock.module("@/components/LeftSideMenu/LeftSideMenu", () => ({
  buildItemKey: jest.fn(),
  buildTagQuery: jest.fn(),
  normalizeTagQuery: jest.fn((value: string) => value),
  parseTagQuery: jest.fn(),
}))

mock.module("@/components", () => ({
  AddFileButton: () => <div />,
  AuthButton: () => <div />,
  BookDescriptionItem: ({ source }: { source: unknown }) => {
    bookImageItemSources.push(source)
    return <div data-testid="library-description-item" />
  },
  BookImageItem: ({ source }: { source: unknown }) => {
    bookImageItemSources.push(source)
    return <div data-testid="library-grid-item" />
  },
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  FlatList: <T,>({
    data,
    renderItem,
  }: {
    data?: T[]
    renderItem: ({ item }: { item: T }) => ReactNode
  }) => <div>{data?.map((item, index) => <div key={index}>{renderItem({ item })}</div>)}</div>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  IconButton: () => <button type="button">icon</button>,
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  LeftSideMenu: () => <div />,
  LibraryViewButton: () => <button type="button">view</button>,
  SelectionActionBar: () => <div />,
  SortMenu: () => <div />,
  StaggerContainer: () => <div />,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  VirtualLibraryButton: () => <div />,
}))

mock.module("@/components/InputField/InputField", () => ({
  InputField: () => <input />,
}))

let LibraryScreen: typeof import("./LibraryScreen").LibraryScreen

function createBook(id: number, title: string) {
  return {
    id,
    metaData: {
      authors: ["Author"],
      title,
    },
  }
}

describe("LibraryScreen", () => {
  const booksMap = new Map<number, ReturnType<typeof createBook>>([
    [1, createBook(1, "Book One")],
    [2, createBook(2, "Book Two")],
  ])

  const selectedLibrary = {
    id: "library-1",
    books: booksMap,
    searchSetting: {
      query: "",
      sort: "title",
      sortOrder: "asc",
    },
    sortField: [],
    virtualLibraries: [],
    tagBrowser: [],
    setBook: jest.fn(),
    selectedBook: null,
  }

  beforeAll(async () => {
    ;({ LibraryScreen } = await import("./LibraryScreen"))
  })

  beforeEach(() => {
    bookImageItemSources.length = 0
    jest.clearAllMocks()

    useStoresMock.mockReturnValue({
      authenticationStore: {
        isAuthenticated: true,
        token: "token-1",
      },
      calibreRootStore: {
        selectedLibrary,
        readingHistories: [],
        searchMoreLibrary: jest.fn(),
        removeReadingHistoriesByBook: jest.fn(),
      },
    })

    useNavigationMock.mockReturnValue({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    })
    useIsFocusedMock.mockReturnValue(true)
    useConvergenceMock.mockReturnValue({ isLarge: false })
    useOpenViewerMock.mockReturnValue({ execute: jest.fn() })
    useDeleteBookMock.mockReturnValue({ execute: jest.fn() })
    useDownloadBookMock.mockReturnValue({ execute: jest.fn() })
    useBulkDownloadBooksMock.mockReturnValue({ execute: jest.fn() })
    useElectrobunModalMock.mockReturnValue({ openModal: jest.fn(), closeModal: jest.fn() })
    useLibraryMock.mockReturnValue({
      currentListStyle: "gridView",
      searching: false,
      isSelectionMode: false,
      selectedBooks: [],
      selectedBookIds: new Set(),
      headerSearchText: "",
      setHeaderSearchText: jest.fn(),
      completeSearchParameter: (text: string) => text,
      onSearch: jest.fn(),
      onSelectVirtualLibrary: jest.fn(),
      onUploadFile: jest.fn(),
      onChangeListStyle: jest.fn(),
      onSort: jest.fn(),
      toggleBookSelection: jest.fn(),
      isBookSelected: jest.fn(() => false),
      clearSelection: jest.fn(),
    })
  })

  test("search rerender reuses the same thumbnail source object for unchanged books", () => {
    const rendered = render(<LibraryScreen />)
    const firstRenderSource = bookImageItemSources[0]

    selectedLibrary.searchSetting.query = "book"

    rendered.rerender(<LibraryScreen />)
    const secondRenderSource = bookImageItemSources[bookImageItemSources.length - 2]

    expect(firstRenderSource).toBe(secondRenderSource)
  })
})
