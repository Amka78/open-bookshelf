import { describe as baseDescribe, test as baseTest, beforeAll, expect, jest, mock } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const mockOpenModal = jest.fn()
const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  Pressable: ({
    children,
    onPress,
    testID,
    ...props
  }: Record<string, unknown> & {
    children?: ReactNode
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress} {...(props as object)}>
      {children}
    </button>
  ),
  StyleSheet: { create: (s: Record<string, unknown>) => s },
  View: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  BookDetailMenu: () => <div data-testid="book-detail-menu" />,
  Box: ({ children }: Record<string, unknown> & { children?: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onPress,
  }: Record<string, unknown> & { children?: ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
  Image: () => <img alt="mock" />,
  Text: ({
    children,
    tx,
    ...props
  }: Record<string, unknown> & { children?: ReactNode; tx?: string }) => (
    <span {...(props as object)}>{tx ?? children}</span>
  ),
  IconButton: ({
    onPress,
    testID,
    name,
  }: {
    onPress?: () => void
    testID?: string
    name?: string
  }) => (
    <button data-testid={testID} data-icon={name} type="button" onClick={onPress}>
      {name}
    </button>
  ),
  LabeledSpinner: () => <div data-testid="labeled-spinner" />,
  MaterialCommunityIcon: () => <span data-testid="material-community-icon" />,
  VStack: ({ children }: Record<string, unknown> & { children?: ReactNode }) => <div>{children}</div>,
}

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    openModal: mockOpenModal,
  }),
}))

mock.module("react-native", () => reactNativeMock)
mock.module("/home/amka78/private/open-bookshelf/node_modules/react-native/index.js", () => reactNativeMock)

mock.module("@/i18n", () => ({
  translate: (key: string) => key,
}))

mock.module("@/theme", () => ({
  usePalette: jest.fn().mockReturnValue({ $primary400: "#6b7cf6" }),
}))

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let BookFormatList: ComponentType<{
  formats: string[]
  onDownload: (format: string) => void
  onDelete: (format: string) => void
  onUpload: () => void
}>

beforeAll(async () => {
  const imported = await import("./BookFormatList")
  BookFormatList = imported.BookFormatList as typeof BookFormatList
})

describe("BookFormatList", () => {
  test("renders all provided formats", () => {
    const { getByText } = render(
      <BookFormatList
        formats={["EPUB", "PDF"]}
        onDownload={jest.fn()}
        onDelete={jest.fn()}
        onUpload={jest.fn()}
      />,
    )
    expect(getByText("EPUB")).toBeTruthy()
    expect(getByText("PDF")).toBeTruthy()
  })

  test("calls onDownload with the correct format when download button is pressed", () => {
    const onDownload = jest.fn()
    const { getByTestId } = render(
      <BookFormatList
        formats={["EPUB"]}
        onDownload={onDownload}
        onDelete={jest.fn()}
        onUpload={jest.fn()}
      />,
    )
    fireEvent.click(getByTestId("download-EPUB"))
    expect(onDownload).toHaveBeenCalledWith("EPUB")
  })

  test("opens the confirmation modal when delete button is pressed", () => {
    mockOpenModal.mockClear()
    const { getByTestId } = render(
      <BookFormatList
        formats={["PDF"]}
        onDownload={jest.fn()}
        onDelete={jest.fn()}
        onUpload={jest.fn()}
      />,
    )
    fireEvent.click(getByTestId("delete-PDF"))
    expect(mockOpenModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "bookFormatList.deleteTooltip",
        messageTx: "bookFormatList.deleteConfirm",
      }),
    )
  })

  test("calls onDelete after the confirmation modal OK handler runs", () => {
    mockOpenModal.mockClear()
    const onDelete = jest.fn()
    const { getByTestId } = render(
      <BookFormatList
        formats={["PDF"]}
        onDownload={jest.fn()}
        onDelete={onDelete}
        onUpload={jest.fn()}
      />,
    )

    fireEvent.click(getByTestId("delete-PDF"))

    const modalParams = mockOpenModal.mock.calls[0]?.[1] as { onOKPress?: () => void } | undefined
    modalParams?.onOKPress?.()

    expect(onDelete).toHaveBeenCalledWith("PDF")
  })

  test("calls onUpload when upload button is pressed", () => {
    const onUpload = jest.fn()
    const { getByTestId } = render(
      <BookFormatList
        formats={[]}
        onDownload={jest.fn()}
        onDelete={jest.fn()}
        onUpload={onUpload}
      />,
    )
    fireEvent.click(getByTestId("upload-format"))
    expect(onUpload).toHaveBeenCalled()
  })
})
