import { vi, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
import { fireEvent, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = vi.fn()
const mockGetBookThumbnailUrl = vi.fn()

vi.doMock("@/models", () => ({
  useStores: useStoresMock,
}))

vi.doMock("@/services/api", () => ({
  api: {
    getBookThumbnailUrl: mockGetBookThumbnailUrl,
  },
}))

vi.doMock("@/hooks/useOpenViewer", () => ({
  useOpenViewer: () => ({ execute: vi.fn() }),
}))

vi.doMock("@/hooks/useDeleteBook", () => ({
  useDeleteBook: () => ({ execute: vi.fn() }),
}))

vi.doMock("@/hooks/useDownloadBook", () => ({
  useDownloadBook: () => ({ execute: vi.fn() }),
}))

vi.doMock("@/components/BookDetailFieldList/BookDetailFieldList", () => ({
  BookDetailFieldList: () => <div data-testid="book-detail-field-list" />,
}))

vi.doMock("@/components/BookDetailMenu/BookDetailMenu", () => ({
  BookDetailMenu: ({ onRunCoverOcr }: { onRunCoverOcr?: () => void }) => (
    <button data-testid="book-detail-run-cover-ocr" type="button" onClick={onRunCoverOcr}>
      OCR
    </button>
  ),
}))

vi.doMock("@/components/BookImageItem/BookImageItem", () => ({
  BookImageItem: () => <div data-testid="book-detail-image" />,
}))

vi.doMock("@/components/Box/Box", () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/components/HStack/HStack", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/components/Heading/Heading", () => ({
  Heading: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/components/VStack/VStack", () => ({
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

vi.doMock("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./Root", () => ({
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let BookDetailModal: typeof import("./BookDetailModal").BookDetailModal

beforeAll(async () => {
  ;({ BookDetailModal } = await import("./BookDetailModal"))
})

describe("BookDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    const openModal = vi.fn()

    const { getByTestId } = render(
      <BookDetailModal
        modal={
          {
            openModal,
            closeModal: vi.fn(),
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
