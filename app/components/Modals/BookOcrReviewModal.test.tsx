import {
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { fireEvent, render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useConvergenceMock = jest.fn()
const recognizeCoverMock = jest.fn()
const mockUpdate = jest.fn().mockResolvedValue(true)
const rootPropsSpy = jest.fn()
const bodyPropsSpy = jest.fn()
const scrollViewPropsSpy = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  ...(global as { __navMock?: Record<string, unknown> }).__navMock,
  useNavigation: useNavigationMock,
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: useConvergenceMock,
}))

mock.module("@/services/ocr", () => ({
  recognizeCover: recognizeCoverMock,
}))

mock.module("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

mock.module("@/screens/BookOcrReviewScreen/BookOcrReviewContent", () => ({
  BookOcrReviewContent: () => <div data-testid="book-ocr-review-content" />,
}))

mock.module("@/components/Button/Button", () => ({
  Button: ({
    onPress,
    children,
    testID,
  }: {
    onPress?: () => void
    children?: ReactNode
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      {children}
    </button>
  ),
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/ScrollView/ScrollView", () => ({
  ScrollView: ({ children, ...props }: { children?: ReactNode }) => {
    scrollViewPropsSpy(props)
    return <div>{children}</div>
  },
}))

mock.module("./Body", () => ({
  Body: ({ children, ...props }: { children?: ReactNode }) => {
    bodyPropsSpy(props)
    return <div>{children}</div>
  },
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button data-testid="book-ocr-close-button" type="button" onClick={onPress}>
      close
    </button>
  ),
}))

mock.module("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./ModalFooter", () => ({
  Footer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./Root", () => ({
  Root: ({ children, ...props }: { children?: ReactNode }) => {
    rootPropsSpy(props)
    return <div>{children}</div>
  },
}))

let BookOcrReviewModal: typeof import("./BookOcrReviewModal").BookOcrReviewModal

beforeAll(async () => {
  ;({ BookOcrReviewModal } = await import("./BookOcrReviewModal"))
})

describe("BookOcrReviewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: {
          id: "lib1",
          selectedBook: {
            id: 1,
            metaData: {
              title: "Original Title",
              authors: [],
              formats: ["EPUB"],
              languages: ["en"],
              langNames: {
                en: "English",
              },
              identifiers: {},
            },
            update: mockUpdate,
          },
          fieldMetadataList: new Map(),
          tagBrowser: [],
        },
      },
    })
    useNavigationMock.mockReturnValue({
      goBack: jest.fn(),
      setOptions: jest.fn(),
    })
    useConvergenceMock.mockReturnValue({
      isLarge: true,
    })
    recognizeCoverMock.mockResolvedValue({
      text: "OCR text",
      fieldEntries: [],
      mappedMetadata: {
        title: "OCR Title",
      },
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("saves through the OCR controller and closes the modal", async () => {
    const closeModal = jest.fn()

    const { getByTestId } = render(
      <BookOcrReviewModal
        modal={
          {
            closeModal,
            params: {
              imageUrl: "https://example.com/ocr-image.jpg",
            },
          } as never
        }
      />,
    )

    await waitFor(() => {
      expect(recognizeCoverMock).toHaveBeenCalled()
    })

    expect(rootPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        width: "96%",
        maxWidth: 1180,
        maxHeight: "92%",
      }),
    )
    expect(bodyPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        flex: 1,
        minHeight: 0,
      }),
    )
    expect(scrollViewPropsSpy).not.toHaveBeenCalled()

    fireEvent.click(getByTestId("book-ocr-save-button"))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
      expect(closeModal).toHaveBeenCalledTimes(1)
    })
  })

  test("keeps the full modal content scrollable on small screens", async () => {
    useConvergenceMock.mockReturnValue({
      isLarge: false,
    })

    render(
      <BookOcrReviewModal
        modal={
          {
            closeModal: jest.fn(),
            params: {
              imageUrl: "https://example.com/ocr-image.jpg",
            },
          } as never
        }
      />,
    )

    await waitFor(() => {
      expect(recognizeCoverMock).toHaveBeenCalled()
    })

    expect(scrollViewPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        flex: 1,
        minHeight: 0,
        keyboardShouldPersistTaps: "handled",
        testID: "book-ocr-review-modal-scroll",
      }),
    )
  })
})
