import { beforeAll, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const mockAlertFn = jest.fn()

mock.module("@/components", () => ({
  ...(global as { __componentsMock?: Record<string, unknown> }).__componentsMock,
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
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
}))

mock.module("react-native", () => ({
  Alert: { alert: mockAlertFn },
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
}))

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

  test("calls Alert.alert when delete button is pressed (confirmation flow)", () => {
    mockAlertFn.mockClear()
    const { getByTestId } = render(
      <BookFormatList
        formats={["PDF"]}
        onDownload={jest.fn()}
        onDelete={jest.fn()}
        onUpload={jest.fn()}
      />,
    )
    fireEvent.click(getByTestId("delete-PDF"))
    expect(mockAlertFn).toHaveBeenCalled()
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
