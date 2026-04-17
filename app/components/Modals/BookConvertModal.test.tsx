import { beforeAll, beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const mockUseBookConvert = jest.fn()
const mockOpenModal = jest.fn()
const reactNativeMockFactory = () => ({
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
})

mock.module("@/components/BookConvertForm/BookConvertForm", () => ({
  BookConvertForm: () => <div data-testid="book-convert-form" />,
}))

mock.module("@/components/Button/Button", () => ({
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

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

mock.module("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button data-testid="close-button" type="button" onClick={onPress}>
      Close
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
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    openModal: mockOpenModal,
  }),
}))

mock.module("@/screens/BookConvertScreen/useBookConvert", () => ({
  useBookConvert: mockUseBookConvert,
}))

mock.module("mobx-react-lite", () => ({
  observer: <T,>(component: T) => component,
}))

mock.module("react-native", reactNativeMockFactory)
mock.module(
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
  const mockHandleStartConvert = jest.fn()
  const mockCloseModal = jest.fn()
  const mockOnConvertComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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
      handleConvert: jest.fn(),
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
