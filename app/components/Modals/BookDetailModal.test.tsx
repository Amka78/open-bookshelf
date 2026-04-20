import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const mockGetBookThumbnailUrl = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@/services/api", () => ({
  api: {
    getBookThumbnailUrl: mockGetBookThumbnailUrl,
  },
}))

mock.module("@/hooks/useOpenViewer", () => ({
  useOpenViewer: () => ({ execute: jest.fn() }),
}))

mock.module("@/hooks/useDeleteBook", () => ({
  useDeleteBook: () => ({ execute: jest.fn() }),
}))

mock.module("@/hooks/useDownloadBook", () => ({
  useDownloadBook: () => ({ execute: jest.fn() }),
}))

mock.module("@/components/BookDetailFieldList/BookDetailFieldList", () => ({
  BookDetailFieldList: () => <div data-testid="book-detail-field-list" />,
}))

mock.module("@/components/BookDetailMenu/BookDetailMenu", () => ({
  BookDetailMenu: ({ onRunCoverOcr }: { onRunCoverOcr?: () => void }) => (
    <button data-testid="book-detail-run-cover-ocr" type="button" onClick={onRunCoverOcr}>
      OCR
    </button>
  ),
}))

mock.module("@/components/BookImageItem/BookImageItem", () => ({
  BookImageItem: () => <div data-testid="book-detail-image" />,
}))

mock.module("@/components/Box/Box", () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/HStack/HStack", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/VStack/VStack", () => ({
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

mock.module("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./Root", () => ({
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let BookDetailModal: typeof import("./BookDetailModal").BookDetailModal

beforeAll(async () => {
  ;({ BookDetailModal } = await import("./BookDetailModal"))
})

describe("BookDetailModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetBookThumbnailUrl.mockReturnValue("https://example.com/ocr-image.jpg")
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "lib1",
          bookDisplayFields: [],
          fieldMetadataList: new Map(),
          selectedBook: {
            id: 1,
            metaData: {
              title: "Test Book",
            },
          },
        },
      },
    })
  })

  test("opens the OCR review modal when OCR is requested from the detail modal", () => {
    const openModal = jest.fn()

    const { getByTestId } = render(
      <BookDetailModal
        modal={
          {
            openModal,
            closeModal: jest.fn(),
            params: {
              imageUrl: "https://example.com/cover.jpg",
            },
          } as never
        }
      />,
    )

    fireEvent.click(getByTestId("book-detail-run-cover-ocr"))

    expect(mockGetBookThumbnailUrl).toHaveBeenCalledWith(1, "lib1", "1200x1600")
    expect(openModal).toHaveBeenCalledWith("BookOcrReviewModal", {
      imageUrl: "https://example.com/ocr-image.jpg",
    })
  })
})
