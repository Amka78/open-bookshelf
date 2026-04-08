import { describe as baseDescribe, test as baseTest, beforeAll, expect, jest, mock } from "bun:test"
import { render } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { useForm } from "react-hook-form"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playClickDisplayedFormatTextTriggersUpload,
  playClickFormatTriggersUpload,
  playMinusDeletesFormatRow,
  playPlusUploadsAndAddsRow,
} from "./formFormatFieldStoryPlay"

mock.module("@/components/VStack/VStack", () => ({
  VStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("@/components/HStack/HStack", () => ({
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("@/components/Input/Input", () => ({
  Input: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({
    children,
    onPress,
    testID,
    ...props
  }: {
    children?: ReactNode
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress} {...(props as object)}>
      {children}
    </button>
  ),
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <span {...(props as object)}>{children}</span>
  ),
}))

mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: ({
    onPress,
    testID,
  }: {
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      icon
    </button>
  ),
}))

type StoryForm = {
  formats: string[]
}

let FormFormatField: ComponentType<{
  control: ReturnType<typeof useForm<StoryForm>>["control"]
  name: "formats"
  testID: string
  onUploadFormat: (params: { targetFormat?: string }) => Promise<{
    success: boolean
    format?: string
  }>
  onDeleteFormat: (format: string) => Promise<boolean>
}>

beforeAll(async () => {
  const imported = await import("./FormFormatField")
  FormFormatField = imported.FormFormatField as typeof FormFormatField
})

function TestHarness({
  onUploadFormat,
  onDeleteFormat,
}: {
  onUploadFormat: (params: { targetFormat?: string }) => Promise<{
    success: boolean
    format?: string
  }>
  onDeleteFormat: (format: string) => Promise<boolean>
}) {
  const form = useForm<StoryForm>({
    defaultValues: {
      formats: ["EPUB", "PDF"],
    },
  })

  return (
    <FormFormatField
      control={form.control}
      name="formats"
      testID="form-format-story"
      onUploadFormat={onUploadFormat}
      onDeleteFormat={onDeleteFormat}
    />
  )
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("FormFormatField story play", () => {
  test("format text click triggers upload processing", async () => {
    const uploadMock = jest
      .fn<(params: { targetFormat?: string }) => Promise<{ success: boolean; format?: string }>>()
      .mockResolvedValue({ success: true })
    const deleteMock = jest.fn<(format: string) => Promise<boolean>>().mockResolvedValue(true)

    const { container } = render(
      <TestHarness onUploadFormat={uploadMock} onDeleteFormat={deleteMock} />,
    )

    await playClickFormatTriggersUpload({
      canvasElement: container,
      baseTestId: "form-format-story",
    })

    expect(uploadMock).toHaveBeenCalledWith({ targetFormat: "EPUB" })
  })

  test("displayed format string click triggers upload processing", async () => {
    const uploadMock = jest
      .fn<(params: { targetFormat?: string }) => Promise<{ success: boolean; format?: string }>>()
      .mockResolvedValue({ success: true })
    const deleteMock = jest.fn<(format: string) => Promise<boolean>>().mockResolvedValue(true)

    const { container } = render(
      <TestHarness onUploadFormat={uploadMock} onDeleteFormat={deleteMock} />,
    )

    await playClickDisplayedFormatTextTriggersUpload({
      canvasElement: container,
      displayedFormat: "EPUB",
    })

    expect(uploadMock).toHaveBeenCalledWith({ targetFormat: "EPUB" })
  })

  test("plus triggers upload and adds row only on success", async () => {
    const uploadMock = jest
      .fn<(params: { targetFormat?: string }) => Promise<{ success: boolean; format?: string }>>()
      .mockResolvedValue({ success: true, format: "AZW3" })
    const deleteMock = jest.fn<(format: string) => Promise<boolean>>().mockResolvedValue(true)

    const { container } = render(
      <TestHarness onUploadFormat={uploadMock} onDeleteFormat={deleteMock} />,
    )

    await playPlusUploadsAndAddsRow({
      canvasElement: container,
      baseTestId: "form-format-story",
    })

    expect(uploadMock).toHaveBeenCalledWith({})
  })

  test("minus deletes the format shown on that row", async () => {
    const uploadMock = jest
      .fn<(params: { targetFormat?: string }) => Promise<{ success: boolean; format?: string }>>()
      .mockResolvedValue({ success: true })
    const deleteMock = jest.fn<(format: string) => Promise<boolean>>().mockResolvedValue(true)

    const { container } = render(
      <TestHarness onUploadFormat={uploadMock} onDeleteFormat={deleteMock} />,
    )

    await playMinusDeletesFormatRow({
      canvasElement: container,
      baseTestId: "form-format-story",
    })

    expect(deleteMock).toHaveBeenCalledWith("PDF")
  })
})
