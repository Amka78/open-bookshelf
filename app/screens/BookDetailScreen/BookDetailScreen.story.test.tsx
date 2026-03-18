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
import { useNavigation, useRoute } from "@react-navigation/native"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { useModal } from "react-native-modalfy"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playBookDetailConvertNavigation,
  playBookDetailDeleteAction,
  playBookDetailDownloadAction,
  playBookDetailEditNavigation,
  playBookDetailOpenAction,
} from "./bookDetailScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseConvergence = jest.fn()
const mockUseDeleteBook = jest.fn()
const mockUseDownloadBook = jest.fn()
const mockUseOpenViewer = jest.fn()

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: mockUseConvergence,
}))

mock.module("../../hooks/useDeleteBook", () => ({
  useDeleteBook: mockUseDeleteBook,
}))

mock.module("../../hooks/useDownloadBook", () => ({
  useDownloadBook: mockUseDownloadBook,
}))

mock.module("../../hooks/useOpenViewer", () => ({
  useOpenViewer: mockUseOpenViewer,
}))

mock.module("@/components", () => ({
  RootContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BookImageItem: () => <div data-testid="book-image-item" />,
  BookDetailFieldList: () => <div data-testid="book-detail-field-list" />,
  BookDetailMenu: ({
    onOpenBook,
    onDownloadBook,
    onConvertBook,
    onEditBook,
    onDeleteBook,
  }: {
    onOpenBook: () => Promise<void>
    onDownloadBook: () => void
    onConvertBook: () => void
    onEditBook: () => void
    onDeleteBook: () => void
  }) => (
    <div>
      <button data-testid="book-detail-open-button" onClick={onOpenBook} type="button">
        Open
      </button>
      <button data-testid="book-detail-download-button" onClick={onDownloadBook} type="button">
        Download
      </button>
      <button data-testid="book-detail-convert-button" onClick={onConvertBook} type="button">
        Convert
      </button>
      <button data-testid="book-detail-edit-button" onClick={onEditBook} type="button">
        Edit
      </button>
      <button data-testid="book-detail-delete-button" onClick={onDeleteBook} type="button">
        Delete
      </button>
    </div>
  ),
}))

let BookDetailScreen: typeof import("./BookDetailScreen").BookDetailScreen

beforeAll(async () => {
  jest.useRealTimers()
  ;({ BookDetailScreen } = await import("./BookDetailScreen"))
})

describe("BookDetailScreen story play", () => {
  const mockNavigate = jest.fn()
  const mockGoBack = jest.fn()
  const mockSetOptions = jest.fn()
  const mockOpenModal = jest.fn()
  const mockOpenBookAction = jest.fn()
  const mockDownloadBookAction = jest.fn()
  const mockConvertNavigationAction = jest.fn()
  const mockEditNavigationAction = jest.fn()
  const mockDeleteBookAction = jest.fn()
  const mockOpenViewerExecute = jest.fn()
  const mockDownloadBookExecute = jest.fn()
  const mockDeleteBookExecute = jest.fn()

  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          selectedBook: {
            id: 1,
            metaData: {
              title: "Test Book",
            },
          },
          fieldMetadataList: {},
          bookDisplayFields: ["title", "authors"],
        },
      },
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      setOptions: mockSetOptions,
    })
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        imageUrl: "https://example.com/image.jpg",
        onLinkPress: jest.fn(),
        onOpenBookAction: mockOpenBookAction,
        onDownloadBookAction: mockDownloadBookAction,
        onNavigateToBookConvert: mockConvertNavigationAction,
        onNavigateToBookEdit: mockEditNavigationAction,
        onDeleteBookAction: mockDeleteBookAction,
      },
    })
    ;(useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
    })

    mockUseConvergence.mockReturnValue({
      isLarge: false,
      orientation: "vertical",
    })
    mockUseOpenViewer.mockReturnValue({
      execute: mockOpenViewerExecute,
    })
    mockUseDeleteBook.mockReturnValue({
      execute: mockDeleteBookExecute,
    })
    mockUseDownloadBook.mockReturnValue({
      execute: mockDownloadBookExecute,
    })
  })

  test("pressing open in the story play triggers open action", async () => {
    const { container } = render(<BookDetailScreen />)

    expect(mockOpenBookAction).not.toHaveBeenCalled()

    await playBookDetailOpenAction({
      canvasElement: container,
    })

    expect(mockOpenBookAction).toHaveBeenCalledTimes(1)
    expect(mockOpenViewerExecute).not.toHaveBeenCalled()
  })

  test("pressing download in the story play triggers download action", async () => {
    const { container } = render(<BookDetailScreen />)

    expect(mockDownloadBookAction).not.toHaveBeenCalled()

    await playBookDetailDownloadAction({
      canvasElement: container,
    })

    expect(mockDownloadBookAction).toHaveBeenCalledTimes(1)
    expect(mockDownloadBookExecute).not.toHaveBeenCalled()
  })

  test("pressing convert in the story play triggers convert navigation action", async () => {
    const { container } = render(<BookDetailScreen />)

    expect(mockConvertNavigationAction).not.toHaveBeenCalled()

    await playBookDetailConvertNavigation({
      canvasElement: container,
    })

    expect(mockConvertNavigationAction).toHaveBeenCalledTimes(1)
    expect(mockConvertNavigationAction).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  test("pressing edit in the story play triggers edit navigation action", async () => {
    const { container } = render(<BookDetailScreen />)

    expect(mockEditNavigationAction).not.toHaveBeenCalled()

    await playBookDetailEditNavigation({
      canvasElement: container,
    })

    expect(mockEditNavigationAction).toHaveBeenCalledTimes(1)
    expect(mockEditNavigationAction).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
    expect(mockNavigate).not.toHaveBeenCalledWith("BookEdit", expect.anything())
  })

  test("pressing delete in the story play triggers delete action", async () => {
    const { container } = render(<BookDetailScreen />)

    expect(mockDeleteBookAction).not.toHaveBeenCalled()

    await playBookDetailDeleteAction({
      canvasElement: container,
    })

    expect(mockDeleteBookAction).toHaveBeenCalledTimes(1)
    expect(mockDeleteBookExecute).not.toHaveBeenCalled()
  })
})
