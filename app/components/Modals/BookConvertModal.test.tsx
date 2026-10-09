import { vi, beforeAll, beforeEach, describe as baseDescribe, expect, test as baseTest } from "vitest"
import { fireEvent, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const mockUseBookConvert = vi.fn()
const mockOpenModal = vi.fn()
const reactNativeMockFactory = () => ({
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
})

vi.doMock("@/components/BookConvertForm/BookConvertForm", () => ({
  BookConvertForm: () => <div data-testid="book-convert-form" />,
}))

vi.doMock("@/components/Button/Button", () => ({
  Button: ({
    children,
    onPress,
    testID,
    tx,
    isDisabled,
  }: {
    children?: ReactNode
    onPress?: () => void | Promise<void>
    testID?: string
    tx?: string
    isDisabled?: boolean
  }) => (
    <button data-testid={testID ?? tx} type="button" onClick={() => void onPress?.()} disabled={isDisabled}>
      {children ?? tx}
    </button>
  ),
}))

vi.doMock("@/components/Heading/Heading", () => ({
  Heading: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

vi.doMock("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button data-testid="close-button" type="button" onClick={onPress}>
      Close
    </button>
  ),
}))

vi.doMock("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./ModalFooter", () => ({
  Footer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("./Root", () => ({
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    openModal: mockOpenModal,
  }),
}))

vi.doMock("@/screens/BookConvertScreen/useBookConvert", () => ({
  useBookConvert: mockUseBookConvert,
}))

vi.doMock("mobx-react-lite", () => ({
  observer: <T,>(component: T) => component,
}))

vi.doMock("react-native", reactNativeMockFactory)
vi.doMock(
  "/home/amka78/private/open-bookshelf/node_modules/react-native/index.js",
  reactNativeMockFactory,
)

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let BookConvertModalTemplate: typeof import("./BookConvertModal").BookConvertModalTemplate

beforeAll(async () => {
  ;({ BookConvertModalTemplate } = await import("./BookConvertModal"))
})

describe("BookConvertModal", () => {
  const mockHandleStartConvert = vi.fn()
  const mockCloseModal = vi.fn()
  const mockOnConvertComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseBookConvert.mockReturnValue({
      selectedBook: {
        metaData: {
          title: "Converted Book",
        },
      },
      inputFormats: ["EPUB"],
      outputFormats: ["PDF"],
      isLoadingFormats: false,
      form: {
        control: {},
        watch: () => "PDF",
      },
      convertStatus: "idle",
      errorMessage: "",
      handleConvert: vi.fn(),
      handleStartConvert: mockHandleStartConvert,
    })
  })

  test("opens a modalfy notification and closes itself after starting a conversion", async () => {
    mockHandleStartConvert.mockResolvedValue(true)

    const { getByTestId } = render(
      <BookConvertModalTemplate
        modal={{
          params: {
            onConvertComplete: mockOnConvertComplete,
          },
          closeModal: mockCloseModal,
        } as never}
      />,
    )

    fireEvent.click(getByTestId("convert-button"))

    await Promise.resolve()

    expect(mockHandleStartConvert).toHaveBeenCalledTimes(1)
    expect(mockOnConvertComplete).toHaveBeenCalledTimes(1)
    expect(mockOpenModal).toHaveBeenCalledWith("ErrorModal", {
      titleTx: "modal.bookConvertModal.title",
      messageTx: "modal.bookConvertModal.conversionStarted",
    })
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })
})
